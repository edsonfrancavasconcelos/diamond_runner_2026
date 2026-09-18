// Local: supabase/functions/asaas-pix-gerador/index.ts
// Status: BACKEND CORRIGIDO - Edson Vasconcelos 2026

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh";

// Headers de CORS para o App React Native conseguir acessar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Responde ao preflight do navegador/mobile
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
    const ASAAS_URL = 'https://sandbox.asaas.com'; // Adicionado /api/v3

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Recebe o ID do perfil e o valor da adesão do App
    const { profileId, amount } = await req.json();

    // 2. Busca os dados do usuário no seu banco
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('full_name, document_id, email, phone_number')
      .eq('id', profileId)
      .single();

    if (userError || !user) throw new Error('Perfil não encontrado no Diamond Runner');

    // 3. Registra/Busca Cliente no Asaas (Limpa CPF antes)
    const cleanCPF = user.document_id?.replace(/\D/g, '');
    
    const customerResp = await fetch(`${ASAAS_URL}/v3/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY! },
      body: JSON.stringify({
        name: user.full_name,
        cpfCnpj: cleanCPF,
        email: user.email,
        mobilePhone: user.phone_number
      })
    });
    const customerData = await customerResp.json();

    // 4. Gera a cobrança PIX
    const paymentResp = await fetch(`${ASAAS_URL}/v3/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY! },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'PIX',
        value: amount,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        externalReference: profileId,
        description: `Adesão Diamond Runner 2026`
      })
    });
    const paymentData = await paymentResp.json();

    // 5. Pega o QR Code e o Copia e Cola
    const pixResp = await fetch(`${ASAAS_URL}/v3/payments/${paymentData.id}/pixQrCode`, {
      method: 'GET',
      headers: { 'access_token': ASAAS_API_KEY! }
    });
    const pixData = await pixResp.json();

    // 6. Salva o registro para controle (Garanta que a tabela payments_asaas exista)
    await supabase.from('profiles').update({
      payment_id: paymentData.id,
      payment_status: 'PENDING'
    }).eq('id', profileId);

    return new Response(JSON.stringify({ 
      pix_code: pixData.payload, 
      encodedImage: pixData.encodedImage, // QR Code em imagem
      invoice_url: paymentData.invoiceUrl 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    });

  } catch (error) {
    console.error("Erro na Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 400 
    });
  }
});
