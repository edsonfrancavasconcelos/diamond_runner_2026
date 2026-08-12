import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Button from "../components/Button";
import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { welcomeTexts } from "../i18n/hooks/texts";
import SelectCountryModal from "./SelectCountryModal";

// NOVA PALETA 2026 APLICADA
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDark } = useTheme();
  const countryContext = useContext(CountryContext);
  const [showModal, setShowModal] = useState(false);

  // Cores dinâmicas baseadas na paleta e no tema
  const themeStyles = {
    bg: isDark ? PALETTE.dark : "#F5F5F7",
    text: isDark ? "#FFFFFF" : PALETTE.dark,
    card: isDark ? "rgba(44, 148, 188, 0.1)" : "rgba(255, 255, 255, 0.9)",
    border: isDark ? "rgba(44, 148, 188, 0.3)" : "rgba(0,0,0,0.05)",
  };

  const country = countryContext?.country || "";
  const selectCountry = countryContext?.selectCountry;

  useEffect(() => {
    if (!country) setShowModal(true);
  }, [country]);

  const texts = welcomeTexts?.[country] || welcomeTexts?.BR;

  if (!themeStyles.bg) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: PALETTE.dark,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeStyles.bg }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.topActions}>
        <TouchableOpacity
          style={[
            styles.themeToggle,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)",
              borderColor: themeStyles.border,
            },
          ]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={PALETTE.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logodiamond.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeHeader}>
          <Text style={[styles.brandTitle, { color: themeStyles.text }]}>
            DIAMOND
          </Text>
          <Text style={[styles.brandSubtitle, { color: PALETTE.primary }]}>
            RUNNER
          </Text>
          <View
            style={[styles.divider, { backgroundColor: PALETTE.primary }]}
          />
        </View>

        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: themeStyles.card,
              borderColor: themeStyles.border,
            },
          ]}
        >
          <Button
            title={String(texts.loginButton || "ENTRAR").toUpperCase()}
            onPress={() =>
              country ? navigation.navigate("LoginDiamond") : setShowModal(true)
            }
            style={{
              backgroundColor: PALETTE.primary,
              height: 55,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              elevation: 4,
              shadowColor: PALETTE.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}
            textStyle={{
              color: "#FFF",
              fontWeight: "bold",
              letterSpacing: 1.2,
              textAlign: "center",
            }}
          />

          <Button
            title={String(texts.registerButton || "CADASTRAR").toUpperCase()}
            variant="outline"
            onPress={() =>
              country
                ? navigation.navigate("ChooseSponsor")
                : setShowModal(true)
            }
            style={{
              borderColor: PALETTE.primary,
              borderWidth: 1.5,
              marginTop: 15,
              height: 55,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
            }}
            textStyle={{
              color: isDark ? "#FFF" : PALETTE.primary,
              fontWeight: "bold",
              textAlign: "center",
            }}
          />

          <TouchableOpacity
            style={styles.langSelector}
            onPress={() => setShowModal(true)}
          >
            <View style={styles.langRow}>
              <Ionicons
                name="globe-outline"
                size={14}
                color={PALETTE.primary}
              />
              <Text
                style={[
                  styles.langText,
                  { color: isDark ? PALETTE.softGray : "#666" },
                ]}
              >
                {texts.changeCountryButton} •{" "}
                <Text style={{ color: PALETTE.primary, fontWeight: "bold" }}>
                  {country || "..."}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <SelectCountryModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={selectCountry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topActions: { position: "absolute", top: 60, right: 25, zIndex: 99 },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  content: { paddingHorizontal: 35, flex: 1, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 50 },
  logo: { width: 200, height: 200 },
  welcomeHeader: { alignItems: "center", marginBottom: 40 },
  brandTitle: { fontSize: 36, fontWeight: "900", letterSpacing: 6 },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 10,
    marginTop: 5,
    paddingLeft: 10,
  },
  divider: { width: 40, height: 3, marginTop: 15, borderRadius: 2 },
  glassCard: {
    borderRadius: 28,
    padding: 25,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  langSelector: { marginTop: 25, alignItems: "center" },
  langRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  langText: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 },
});
