// Edge Function: stripe-webhook
// Substitui diamond-backend/src/controllers/StripeWebhookController.ts
// Recebe eventos do Stripe (checkout.session.completed) e ativa o associado.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";

async function ensureIdDr(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id_dr")
    .eq("id", userId)
    .single();
  if (profileError) throw profileError;
  if (profile?.id_dr) return profile.id_dr;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `DR${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id_dr", candidate)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return candidate;
  }

  throw new Error("Não foi possível gerar um ID DR disponível");
}

Deno.serve(async (req) => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");

  if (!stripeSecretKey || !webhookSecret || !signature) {
    return new Response(JSON.stringify({ error: "Configuração ou assinatura Stripe ausente" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Assinatura Stripe inválida:", err);
    return new Response(JSON.stringify({ error: "Assinatura Stripe inválida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase.from("payments").update({ status: "failed" })
      .eq("stripe_session_id", session.id);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await supabase.from("payments").update({ status: "failed" })
      .eq("stripe_payment_id", paymentIntent.id);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : null;

    if (paymentIntentId) {
      const { data: payment } = await supabase.from("payments")
        .select("user_id")
        .eq("stripe_payment_id", paymentIntentId)
        .maybeSingle();

      await supabase.from("payments").update({ status: "refunded" })
        .eq("stripe_payment_id", paymentIntentId);

      if (payment?.user_id) {
        await supabase.from("subscriptions")
          .update({ status: "refunded", data_fim: new Date().toISOString() })
          .eq("user_id", payment.user_id)
          .eq("status", "active");
        await supabase.from("profiles").update({
          status: "PENDING",
          is_active: false,
          updated_at: new Date().toISOString(),
        }).eq("id", payment.user_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const planName = session.metadata?.plan_name || "ASSOCIADO";
  const amountTotal = session.amount_total ?? 0;
  const paidAt = new Date().toISOString();

  // Fluxo novo: checkout criado via create-checkout (tem user_id/plan_id no metadata).
  // Atualiza payments/subscriptions e ativa o profile por id, sem tocar no fluxo antigo abaixo.
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;
  if (userId) {
    const { data: existingPayment } = await supabase.from("payments")
      .select("status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existingPayment?.status === "paid") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const idDr = await ensureIdDr(supabase, userId);
    await supabase
      .from("payments")
      .update({
        status: "paid",
        stripe_payment_id: session.payment_intent ? String(session.payment_intent) : session.id,
      })
      .eq("stripe_session_id", session.id);

    if (planId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plano_id: planId,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        status: "active",
        data_inicio: paidAt,
      }, { onConflict: "user_id,plano_id" });
    }

    await supabase
      .from("profiles")
      .update({
        status: "ATIVO",
        is_active: true,
        id_dr: idDr,
        plan_name: planName,
        updated_at: paidAt,
      })
      .eq("id", userId);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fluxo antigo: Stripe Payment Links estáticos (sem metadata.user_id), casa por e-mail.
  const email = session.customer_details?.email || session.customer_email ||
    session.metadata?.email;
  if (!email) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, id_dr")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (profileError) {
    return new Response(JSON.stringify({ error: "Não foi possível localizar o associado" }), {
      status: 500,
    });
  }
  if (!profile) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const idDr = await ensureIdDr(supabase, profile.id);
  const { error } = await supabase
    .from("profiles")
    .update({
      status: "ATIVO",
      is_active: true,
      id_dr: idDr,
      plan_name: planName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    return new Response(JSON.stringify({ error: "Não foi possível ativar o associado" }), {
      status: 500,
    });
  }

  const authUser = await supabase.auth.admin.getUserById(profile.id);
  if (!authUser.error && authUser.data.user) {
    await supabase.auth.admin.updateUserById(profile.id, {
      user_metadata: {
        ...authUser.data.user.user_metadata,
        payment_status: "confirmed",
        profile_active: true,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_payment_id: session.payment_intent ? String(session.payment_intent) : null,
        amount_total: amountTotal,
        paid_at: paidAt,
        plan_name: planName,
      },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
