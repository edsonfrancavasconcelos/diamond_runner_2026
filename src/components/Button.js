import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../i18n/context/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  style = {},
  textStyle = {},
}) {
  // ✅ 1. Proteção: Garante que o hook nunca retorne undefined para desestruturação
  const themeContext = useTheme() || {};
  
  // ✅ 2. Fallback de cores: Se o tema ainda não carregou, usa cores padrão do Diamond (Dark)
  const theme = themeContext.theme || {
    primary: '#0def19',
    bg: '#121212',
    text: '#FFFFFF'
  };

  const isOutline = variant === 'outline';
  
  const dynamicButtonStyle = {
    backgroundColor: isOutline ? 'transparent' : (theme.primary || '#0def19'),
    borderColor: theme.primary || '#0def19',
    borderWidth: isOutline ? 2 : 0,
  };

  const dynamicTextStyle = {
    color: isOutline ? (theme.primary || '#0def19') : '#FFFFFF',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      // ✅ 3. Uso de array para estilos evita o erro de conversão de objeto
      style={[
        styles.button,
        dynamicButtonStyle,
        style || {}
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.baseText,
          dynamicTextStyle,
          textStyle || {}
        ]}
      >
        {/* ✅ 4. Garante que title seja sempre uma string */}
        {String(title || '')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  baseText: {
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
});
