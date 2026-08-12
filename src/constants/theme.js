

// Definição das cores oficiais da marca Diamond
const diamondBlue = '#0056b3'; // Azul da Logo
const graphiteGrey = '#2B2B2B'; // Cinza Fundo elegante
const deepBlack = '#1F1F1F';    // Preto para Cards/Inputs

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    card: '#FFFFFF',
    tint: diamondBlue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: diamondBlue,
    border: '#D1D1D6',
  },
  dark: {
    text: '#FFFFFF',
    background: graphiteGrey,
    card: deepBlack,
    tint: diamondBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: diamondBlue,
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

// Alias padrão (mantém compatibilidade com o app atual)
export const COLORS = Colors.dark;

// Fontes neutras e seguras (Expo / Android / iOS / Web)
export const Fonts = {
  sans: 'System',
  serif: 'serif',
  rounded: 'System',
  mono: 'monospace',
};

// Tamanhos padrão para manter consistência visual
export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  h1: 32,
  h2: 24,
  h3: 18,
};

export default {
  Colors,
  COLORS,
  Fonts,
  SIZES,
};
