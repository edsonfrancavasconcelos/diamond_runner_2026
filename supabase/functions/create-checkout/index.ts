// Edge Function: create-checkout
// Cria uma Stripe Checkout Session dinâmica para o plano escolhido.
// Nunca expõe STRIPE_SECRET_KEY ao app — tudo roda aqui no backend (Supabase Edge Function).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const APP_URL = Deno.env.get("APP_URL") || "https://diamond-runner-2026.vercel.app";

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Configuração ausente no servidor" }, 500);
    }

    const { planId, planName, email } = await req.json();

    // O cadastro pode estar deslogado enquanto aguarda o pagamento. Nesse caso,
    // só permitimos checkout para um perfil PENDING e usamos o e-mail salvo no banco.
    const authHeader = req.headers.get("Authorization");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let userId: string | null = null;
    let customerEmail: string | null = null;

    if (authHeader) {
      const accessToken = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
      if (!userError && user) {
        userId = user.id;
        customerEmail = user.email ?? null;
      }
    }

    if (!userId && email) {
      const { data: pendingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, status")
        .eq("email", String(email).trim().toLowerCase())
        .maybeSingle();

      if (profileError || !pendingProfile || String(pendingProfile.status).toUpperCase() !== "PENDING") {
        return json({ error: "Cadastro pendente não encontrado" }, 401);
      }
      userId = pendingProfile.id;
      customerEmail = pendingProfile.email;
    }

    if (!userId || !customerEmail) {
      return json({ error: "Usuário não identificado" }, 401);
    }

    if (!planId && !planName) {
      return json({ error: "Informe planId ou planName" }, 400);
    }

    // O preço vem sempre do banco (plans.stripe_price_id), nunca do app — evita manipulação de valor pelo cliente.
    let planQuery = supabase.from("plans").select("*").eq("ativo", true);
    planQuery = planId ? planQuery.eq("id", planId) : planQuery.ilike("nome", planName);
    const { data: plan, error: planError } = await planQuery.maybeSingle();

    if (planError || !plan) {
      return json({ error: "Plano inválido ou indisponível" }, 404);
    }
    if (!plan.stripe_price_id) {
      return json({ error: "Plano sem price_id configurado no Stripe" }, 400);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?checkout=cancel`,
      metadata: {
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.nome,
      },
    });

    // Registra o pagamento como "pending"; o stripe-webhook confirma e ativa quando o Stripe notificar.
    await supabase.from("payments").insert({
      user_id: userId,
      plano_id: plan.id,
      stripe_session_id: session.id,
      status: "pending",
      valor: plan.preco,
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Erro no create-checkout:", error);
    return json({ error: "Erro ao criar checkout" }, 500);
  }
});
