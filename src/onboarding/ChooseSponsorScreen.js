
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../components/Button";
import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { chooseSponsorTexts } from "../i18n/hooks/texts";

// PALETA 2026 - APLICADA DIRETAMENTE
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function ChooseSponsorScreen() {
  const navigation = useNavigation();
  const { country } = useContext(CountryContext);
  const { theme, toggleTheme, isDark } = useTheme();
  const texts = chooseSponsorTexts[country] || chooseSponsorTexts.BR;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={PALETTE.primary} />
        </TouchableOpacity>

    
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={22}
            color={isDark ? "#FFD700" : PALETTE.dark}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.badge,
            { borderColor: PALETTE.primary, backgroundColor: theme.card },
          ]}
        >
          <Text style={[styles.badgeText, { color: PALETTE.primary }]}>
            {country?.toUpperCase()} OPS
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.tagline, { color: PALETTE.primary }]}>
          {texts.tagline?.toUpperCase() || "ETAPA DE ADMISSÃO"}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          {texts.title?.toUpperCase() || "ESCOLHA SUA OPÇÃO"}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? PALETTE.softGray : "#535355" },
          ]}
        >
          {texts.subtitle ||
            "Selecione sua forma de entrada no ecossistema Diamond."}
        </Text>

        <View style={styles.actionBox}>
          <View style={styles.buttonWrapper}>
            <Button
              title={texts.hasSponsor?.toUpperCase() || "TENHO UM PATROCINADOR"}
              onPress={() => navigation.navigate("HasSponsor", { country })}
              style={{
                backgroundColor: PALETTE.primary,
                height: 55,
                borderRadius: 14,
                justifyContent: "center",
                alignItems: "center",
              }}
              textStyle={{
                color: "#FFF",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />
          </View>

             <TouchableOpacity
            style={styles.outlineAction}      
            // 💎 CORREÇÃO: Mudamos de "SelectProfile" para "FindSponsor"
            onPress={() => navigation.navigate("FindSponsor", { country })}
          >
            <Text
              style={[
                styles.outlineText,
                { color: isDark ? PALETTE.light : "#6c6c6f" },
              ]}
            >
              {texts.noSponsor?.toUpperCase() || "NÃO TENHO CONVITE"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={isDark ? PALETTE.light : "#8E8E93"}
            />
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark"
          size={12}
          color={isDark ? PALETTE.grayBlue : "#CCC"}
        />
        <Text
          style={[
            styles.securityText,
            { color: isDark ? PALETTE.grayBlue : "#CCC" },
          ]}
        >
          {texts.footer || "PROTOCOLOS DE AFILIAÇÃO ATIVOS 2026"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "bold", letterSpacing: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 10 },
  tagline: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 50,
    lineHeight: 18,
  },
  actionBox: { width: "100%" },
  buttonWrapper: { marginBottom: 20 },
  outlineAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  outlineText: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  securityText: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 6,
  },
});
