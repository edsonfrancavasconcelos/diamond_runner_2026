// Autor: Edson Vasconcelos
// Arquivo: src/i18n/context/CountryContext.js
// Descrição: Gerenciamento global do país/idioma com persistência local (AsyncStorage)

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CountryContext = createContext({
  country: null,
  loading: true,
  selectCountry: () => {},
});

export function CountryProvider({ children }) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega o país salvo ao iniciar o app
  useEffect(() => {
    async function loadSavedCountry() {
      try {
        const savedCountry = await AsyncStorage.getItem('APP_COUNTRY');
        if (savedCountry) {
          setCountry(savedCountry);
        }
      } catch (e) {
        console.error('Erro ao carregar país do AsyncStorage:', e);
      } finally {
        setLoading(false); // Finaliza o carregamento independente de sucesso ou erro
      }
    }
    loadSavedCountry();
  }, []);

// Função para mudar o país e salvar permanentemente
const selectCountry = async (countryCode) => {
  try {
    const codeFixed = countryCode.toUpperCase(); // Garante 'BR', 'EN' ou 'ES'
    setCountry(codeFixed);
    await AsyncStorage.setItem('APP_COUNTRY', codeFixed);
  } catch (e) {
    console.error('Erro ao salvar país no AsyncStorage:', e);
  }
};


  return (
    <CountryContext.Provider value={{ country, loading, selectCountry }}>
      {children}
    </CountryContext.Provider>
  );
}
