import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useContext } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

import Button from "../components/Button";
import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { paymentTexts } from "../i18n/hooks/texts";

// NOVA PALETA 2026
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const { country: contextCountry } = useContext(CountryContext);

  const country = route.params?.country || contextCountry || "BR";
  const texts = paymentTexts[country] || paymentTexts.BR || {};

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.iconContainer}>
        {/* Anel de Pulso com a cor Primária da Paleta */}
        <View style={[styles.pulseRing, { borderColor: PALETTE.primary }]} />
        <Ionicons name="checkmark-circle" size={100} color={PALETTE.primary} />
      </View>

      <View style={styles.textContent}>
        <Text style={[styles.title, { color: theme.text }]}>
          {(texts.successTitle || "ACESSO LIBERADO").toUpperCase()}
        </Text>
        <View style={[styles.divider, { backgroundColor: PALETTE.primary }]} />
        <Text
          style={[
            styles.message,
            { color: isDark ? PALETTE.softGray : "#666" },
          ]}
        >
          {texts.successMessage ||
            "Sua licença Diamond foi ativada. Bem-vindo ao grupo executivo."}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={(texts.goToOffice || "ENTRAR NO ESCRITÓRIO").toUpperCase()}
          onPress={() => navigation.replace("Office")}
          style={{
            backgroundColor: PALETTE.primary,
            height: 55,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
          textStyle={{ color: "#FFF", fontWeight: "bold", textAlign: "center" }}
        />
        <Text style={[styles.idTag, { color: isDark ? PALETTE.dark : "#ccc" }]}>
          LICENSE_ACTIVE_2026_X9
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 35, justifyContent: "center" },
  iconContainer: { alignItems: "center", marginBottom: 40 },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    opacity: 0.2,
    transform: [{ scale: 1.2 }],
  },
  textContent: { alignItems: "center", marginBottom: 50 },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
  },
  divider: { width: 40, height: 3, marginVertical: 20, borderRadius: 2 },
  message: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: { width: "100%" },
  idTag: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 25,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
});
