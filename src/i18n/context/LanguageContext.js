// src/i18n/context/LanguageContext.js
import React, { createContext, useContext, useState, useMemo } from "react";
import * as texts from "../hooks/texts";

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("BR");
  const contextValue = useMemo(() => ({ language, setLanguage, texts }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
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
