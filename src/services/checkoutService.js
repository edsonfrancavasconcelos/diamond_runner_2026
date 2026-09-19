import { supabase } from './supabase';

// Cria uma Stripe Checkout Session via Supabase Edge Function (create-checkout)
// e retorna a URL segura de pagamento. Nenhuma chave do Stripe passa pelo app.
export const createCheckoutSession = async (planName) => {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { planName },
  });

  if (error) {
    throw error;
  }

  return data.url;
};
