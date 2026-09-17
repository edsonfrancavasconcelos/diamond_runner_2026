import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEFINIÇÃO DA NOVA PALETA 2026
const COLORS = {
  blue1: '#2c94bc', // Primário
  blue2: '#bcdcf4', // Secundário / Light
  blue3: '#0c3c74', // Dark Blue (Excelente para fundos Dark)
  blue4: '#647c9c', // Gray Blue
  blue5: '#a4bccc', // Soft Gray
};

const ThemeContext = createContext({
  isDark: true,
  theme: {},
  toggleTheme: () => {},
  ready: false,
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('@diamond_theme');
        if (saved !== null) {
          setIsDark(saved === 'dark');
        } else {
          setIsDark(systemScheme === 'dark');
        }
      } catch (e) {
        console.error("Erro ao carregar tema", e);
      } finally {
        setReady(true);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem('@diamond_theme', next ? 'dark' : 'light');
    } catch (e) {
      console.error("Erro ao salvar tema", e);
    }
  };


  const theme = {
    isDark,
    primary: COLORS.blue1,
    secondary: COLORS.blue2,
    bg: isDark ? COLORS.blue3 : '#F8FAFC', 
    text: isDark ? '#FFFFFF' : COLORS.blue3,
    card: isDark ? 'rgba(44, 148, 188, 0.15)' : '#FFFFFF',
    border: isDark ? COLORS.blue4 : COLORS.blue5,
    button: isDark ? COLORS.blue1 : COLORS.blue3,
    input: isDark ? 'rgba(188, 220, 244, 0.1)' : '#FFFFFF',
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
