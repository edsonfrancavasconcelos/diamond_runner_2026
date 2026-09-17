// src/services/currencyService.js

// ✅ Chave correta
const API_KEY = '4c17ca932cae5bc9123aa619'; 

// ✅ URL CORRIGIDA (Adicionado /v6/ e o $ antes da chave)
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/BRL`;

export const fetchExchangeRate = async () => {
  try {
    const response = await fetch(API_URL);

    // Se a URL estiver errada ou a chave bloqueada, o fetch retorna erro aqui
    if (!response.ok) {
       throw new Error(`Erro na rede: ${response.status}`);
    }

    const data = await response.json();

    if (data.result === "error") {
        throw new Error(`Erro na API: ${data['error-type']}`);
    }

    // Retorna quanto vale 1 Real em Dólar (ex: 0.17)
    return data.conversion_rates.USD; 

  } catch (error) {
    console.error("Erro ao buscar cotação real:", error.message);
    // ✅ Fallback vital: se a internet cair, o app não trava e usa 0.18
    return 0.18; 
  }
};
