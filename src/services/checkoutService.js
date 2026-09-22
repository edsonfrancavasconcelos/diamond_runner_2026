import { supabase } from './supabase';

// Cria uma Stripe Checkout Session via Supabase Edge Function (create-checkout)
// e retorna a URL segura de pagamento. Nenhuma chave do Stripe passa pelo app.
export const createCheckoutSession = async (planName, email) => {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { planName, email },
  });

  if (error) {
    throw error;
  }

  return { url: data.url, sessionId: data.sessionId };
};
