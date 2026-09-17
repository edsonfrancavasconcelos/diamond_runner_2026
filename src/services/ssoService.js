import api from './api';

export const createSSOToken = async (appSlug) => {
  const response = await api.post('/create-sso', {
    app: appSlug
  });

  return response.data.token;
};
