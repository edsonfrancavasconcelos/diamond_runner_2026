// Edge Function: stripe-webhook
// Substitui diamond-backend/src/controllers/StripeWebhookController.ts
// Recebe eventos do Stripe (checkout.session.completed) e ativa o associado.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";

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

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const email = session.customer_details?.email || session.customer_email ||
    session.metadata?.email;
  if (!email) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const planName = session.metadata?.plan_name || "ASSOCIADO";
  const amountTotal = session.amount_total ?? 0;
  const paidAt = new Date().toISOString();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
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

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "ATIVO",
      is_active: true,
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
