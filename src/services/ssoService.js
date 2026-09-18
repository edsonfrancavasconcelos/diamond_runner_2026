import { supabase } from './supabase';

export const createSSOToken = async (appSlug) => {
  const { data, error } = await supabase.functions.invoke('create-sso', {
    body: { app: appSlug },
  });

  if (error) {
    throw error;
  }

  return data.token;
};
