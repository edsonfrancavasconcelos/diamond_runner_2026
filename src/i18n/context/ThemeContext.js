import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem('@diamond_theme', next ? 'dark' : 'light');
    } catch (e) {
      console.error("Erro ao salvar tema", e);
    }
  }, [isDark]);


  const theme = useMemo(() => ({
    isDark,
    primary: COLORS.blue1,
    secondary: COLORS.blue2,
    bg: isDark ? COLORS.blue3 : '#F8FAFC', 
    text: isDark ? '#FFFFFF' : COLORS.blue3,
    card: isDark ? 'rgba(44, 148, 188, 0.15)' : '#FFFFFF',
    border: isDark ? COLORS.blue4 : COLORS.blue5,
    button: isDark ? COLORS.blue1 : COLORS.blue3,
    input: isDark ? 'rgba(188, 220, 244, 0.1)' : '#FFFFFF',
  }), [isDark]);

  const contextValue = useMemo(() => ({ isDark, theme, toggleTheme, ready }), [isDark, theme, toggleTheme, ready]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// --- COMPONENTES ADICIONADOS NO MESMO FICHEIRO (SEM MEXER NO TEU CÓDIGO ACIMA) ---

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: isDark ? 'rgba(44, 148, 188, 0.3)' : '#E2E8F0' }
      ]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={isDark ? 'sunny' : 'moon'} 
        size={22} 
        color={isDark ? '#bcdcf4' : '#0c3c74'} 
      />
    </TouchableOpacity>
  );
};

export const ThemeContainer = ({ children }) => {
  const { theme, ready } = useTheme();

  if (!ready) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {children}
      <ThemeToggleButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});