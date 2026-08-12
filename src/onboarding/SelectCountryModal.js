// Autor: Edson Vasconcelos | Atualizado em 26 de Jan 2026
// Arquivo: src/onboarding/SelectCountryModal.js
// Estilo: Nova Paleta Blue Diamond 2026

import React, { useContext, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { welcomeTexts } from "../i18n/hooks/texts";

const { height } = Dimensions.get("window");

// NOVA PALETA 2026
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function SelectCountryModal({ visible, onClose, onSelect }) {
  const { theme, isDark } = useTheme();

  const slideAnim = useRef(new Animated.Value(height)).current;
  const countryContext = useContext(CountryContext);
  const country = countryContext?.country;

  const texts = (welcomeTexts && country
    ? welcomeTexts[country]
    : welcomeTexts?.BR) || {
    changeCountryButton: "Selecionar País",
    back: "Voltar",
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function handleSelect(countryCode) {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onSelect) onSelect(countryCode);
      if (onClose) onClose();
    });
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? "rgba(12, 60, 116, 0.85)"
              : "rgba(0,0,0,0.5)",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.dismissArea}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.bg,
              borderColor: isDark ? PALETTE.primary : theme.border,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: isDark ? PALETTE.grayBlue : "#ddd" },
            ]}
          />

          <Text style={[styles.title, { color: PALETTE.primary }]}>
            REGIÃO OPERACIONAL
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? PALETTE.softGray : "#999" },
            ]}
          >
            {String(texts.changeCountryButton || "").toUpperCase()}
          </Text>

          <View style={styles.optionsGrid}>
            {[
              { id: "BR", label: "Brasil", flag: "🇧🇷" },
              { id: "ES", label: "Paraguay", flag: "🇵🇾" },
              { id: "EN", label: "United States", flag: "🇺🇸" },
            ].map((item) => {
              const isSelected = country === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isSelected
                      ? {
                          borderColor: PALETTE.primary,
                          backgroundColor: isDark
                            ? "rgba(44, 148, 188, 0.1)"
                            : PALETTE.light,
                        }
                      : {},
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.countryLabel,
                      {
                        color: theme.text,
                        fontWeight: isSelected ? "bold" : "500",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={[styles.dot, { backgroundColor: PALETTE.primary }]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text
              style={[
                styles.cancelText,
                { color: isDark ? PALETTE.softGray : "#aaa" },
              ]}
            >
              {String(texts.back || "VOLTAR").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  dismissArea: { flex: 1 },
  container: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: 50,
    borderWidth: 1.5,
  },
  handle: {
    width: 45,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 30,
    marginTop: 8,
  },
  optionsGrid: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  flag: { fontSize: 22, marginRight: 15 },
  countryLabel: { fontSize: 16, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  closeButton: { marginTop: 25, padding: 15 },
  cancelText: {
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "900",
  },
});
