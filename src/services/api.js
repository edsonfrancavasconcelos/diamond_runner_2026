import axios from 'axios';

const getBaseURL = () => {
  // 1. Tenta ler do .env (EXPO_PUBLIC_API_URL)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Fallback para Desenvolvimento (Se o .env falhar)
  if (__DEV__) {
    // Usando seu IP local para evitar o Timeout do ngrok
    // Se usar emulador Android no PC, tente 'http://10.0.2.2:3333'
    return 'http://192.168.0.254:3333'; 
  }

  // 3. Produção
  return 'https://api.diamondrunner.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Aumentado para 30s para evitar quedas em redes oscilantes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Log para você ver no terminal do VSCode onde o App está tentando bater
console.log("💎 Diamond Runner API conectada em:", api.defaults.baseURL);

export default api;
