// src/i18n/context/LanguageContext.js
import React, { createContext, useContext, useState } from "react";
import * as texts from "../hooks/texts";

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("BR");

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        texts, // 👈 NOME PADRÃO
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
};
