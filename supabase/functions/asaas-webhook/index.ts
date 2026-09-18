// Edge Function: asaas-webhook
// Substitui diamond-backend/src/controllers/AsaasWebhookController.ts
// Recebe eventos PAYMENT_RECEIVED/PAYMENT_CONFIRMED do Asaas, ativa o usuário e paga comissão do patrocinador.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function ok() {
  return new Response("OK", { status: 200 });
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { event, payment } = await req.json();

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      const paymentId = payment?.id;
      const userId = payment?.externalReference;
      const amount = Number(payment?.value || 0);

      if (!userId) return ok();

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !userProfile) {
        console.error("❌ Asaas Webhook: Usuário não encontrado", userId);
        return ok();
      }

      if (userProfile.status === "active") {
        console.log(`⚠️ Usuário ${userId} já está ativo. Ignorando.`);
        return ok();
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          status: "active",
          payment_status: "CONFIRMED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("❌ Asaas Webhook: Erro ao ativar usuário", updateError);
        return ok();
      }

      console.log(`✅ Pagamento Asaas confirmado: ${paymentId}. Usuário ${userId} ativado.`);

      const sponsorId = userProfile.sponsor_id;
      if (sponsorId) {
        let commissionRate = 0;
        if (amount >= 1599) commissionRate = 0.27;
        else if (amount >= 799) commissionRate = 0.20;
        else if (amount >= 299) commissionRate = 0.12;
        else if (amount >= 99) commissionRate = 0.10;

        if (commissionRate > 0) {
          const commissionAmount = amount * commissionRate;

          const { data: sponsorProfile } = await supabase
            .from("profiles")
            .select("balance, direct_bonus")
            .eq("id", sponsorId)
            .single();

          if (sponsorProfile) {
            const newBalance = Number(sponsorProfile.balance || 0) + commissionAmount;
            const newDirectBonus = Number(sponsorProfile.direct_bonus || 0) + commissionAmount;

            const { error: sponsorUpdateError } = await supabase
              .from("profiles")
              .update({ balance: newBalance, direct_bonus: newDirectBonus })
              .eq("id", sponsorId);

            if (!sponsorUpdateError) {
              await supabase.from("earnings").insert({
                user_id: sponsorId,
                amount: commissionAmount,
                description: `Bônus de Indicação Direta - Adesão R$ ${amount.toFixed(2)}`,
                created_at: new Date().toISOString(),
              });

              console.log(
                `💰 Comissão de R$ ${commissionAmount.toFixed(2)} paga para o patrocinador ${sponsorId}`,
              );
            } else {
              console.error(
                "❌ Asaas Webhook: Erro ao atualizar saldo do patrocinador",
                sponsorUpdateError,
              );
            }
          }
        }
      }
    }

    return ok();
  } catch (error) {
    console.error("❌ Erro no Webhook Asaas:", error);
    return ok();
  }
});
