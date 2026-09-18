// Edge Function: create-sso
// Substitui diamond-backend/src/controllers/SsoController.ts
// Gera um token JWT de curta duração para autorizar o WebView a acessar apps externos.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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

async function getJwtKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const JWT_SECRET = Deno.env.get("JWT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!JWT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Configuração ausente no servidor" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Token não enviado" }, 401);
    }
    const accessToken = authHeader.replace("Bearer ", "");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return json({ error: "Usuário inválido" }, 401);
    }

    const { app } = await req.json();
    if (!app) {
      return json({ error: "App não informado" }, 400);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status, is_active")
      .eq("id", user.id)
      .single();

    const enabledApps = user.user_metadata?.enabled_apps || [];
    const isAdmin = user.user_metadata?.role === "admin";
    const isActive = profile?.is_active &&
      ["active", "ativo"].includes(String(profile.status).toLowerCase());

    if (profileError || !isActive || (!isAdmin && !enabledApps.includes(app))) {
      return json({ error: "Módulo não liberado para este usuário" }, 403);
    }

    const key = await getJwtKey(JWT_SECRET);
    const ssoToken = await create(
      { alg: "HS256", typ: "JWT" },
      {
        user_id: user.id,
        email: user.email,
        app,
        exp: getNumericDate(5 * 60), // 5 minutos
      },
      key,
    );

    return json({ token: ssoToken });
  } catch (error) {
    console.error("Erro no create-sso:", error);
    return json({ error: "Erro interno no SSO" }, 500);
  }
});
