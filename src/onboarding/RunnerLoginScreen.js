// Arquivo: src/onboarding/RunnerLoginScreen.js
// Atualizado em 26 de Jan 2026 com a Nova Paleta Blue Diamond
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../components/Button";
import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { runnerLoginTexts } from "../i18n/hooks/texts";

// NOVA PALETA 2026
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function RunnerLoginScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { country } = useContext(CountryContext);
  const texts = runnerLoginTexts[country] || runnerLoginTexts.BR || {};

  const [form, setForm] = useState({ codigo: "", cpf: "", email: "" });

  const handleLogin = () => {
    const mockMode = process.env.EXPO_PUBLIC_MOCK_MODE === "true" || process.env.EXPO_PUBLIC_MOCK_MODE === "1";

    // Developer mock login: permite usar `dr1000` / `123456` para acessar rapidamente
    if (mockMode) {
      if (form.codigo === "dr1000" && (form.cpf === "123456" || form.email === "123456")) {
        navigation.navigate("Dashboard");
        return;
      }
      Alert.alert("Autenticação", "Credenciais inválidas para o modo de teste (use dr1000 / 123456)");
      return;
    }

    if (!form.codigo || !form.cpf || !form.email) {
      Alert.alert(
        "Autenticação",
        texts.alertFill || "Preencha todos os campos",
      );
      return;
    }

    navigation.navigate("Dashboard");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => navigation.navigate("Welcome")}
        >
          <Ionicons name="close-outline" size={24} color={PALETTE.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTag, { color: PALETTE.primary }]}>
          DIAMOND ACCESS
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          BEM-VINDO AO CLUBE
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? PALETTE.softGray : "#999" },
          ]}
        >
          Identifique-se para acessar seu escritório virtual.
        </Text>

        <View style={styles.form}>
          <LoginInput
            label="CÓDIGO DE DISTRIBUIDOR"
            placeholder={texts.distributorCode || "CÓDIGO"}
            value={form.codigo}
            onChange={(v) => setForm({ ...form, codigo: v })}
            autoCap="characters"
            theme={theme}
            isDark={isDark}
          />

          <LoginInput
            label="DOCUMENTO (CPF)"
            placeholder={texts.cpf || "000.000.000-00"}
            value={form.cpf}
            onChange={(v) => setForm({ ...form, cpf: v })}
            keyboard="numeric"
            theme={theme}
            isDark={isDark}
          />

          <LoginInput
            label="E-MAIL REGISTRADO"
            placeholder={texts.email || "seu@email.com"}
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            keyboard="email-address"
            theme={theme}
            isDark={isDark}
          />
        </View>

        <Button
          title={(texts.loginButton || "ENTRAR").toUpperCase()}
          onPress={handleLogin}
          style={{
            backgroundColor: PALETTE.primary,
            height: 55,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
          textStyle={{ color: "#FFF", fontWeight: "bold" }}
        />

        <TouchableOpacity style={styles.forgotPass}>
          <Text
            style={[
              styles.forgotText,
              { color: isDark ? PALETTE.grayBlue : "#aaa" },
            ]}
          >
            PROBLEMAS COM O ACESSO?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const LoginInput = ({
  label,
  placeholder,
  value,
  onChange,
  theme,
  isDark,
  keyboard = "default",
  autoCap = "none",
}) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, { color: PALETTE.primary }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        { color: theme.text, borderBottomColor: theme.border },
      ]}
      placeholder={placeholder}
      placeholderTextColor={isDark ? "#444" : "#ccc"}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      autoCapitalize={autoCap}
      selectionColor={PALETTE.primary}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 55,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTag: { fontSize: 10, fontWeight: "bold", letterSpacing: 2 },
  content: { flex: 1, paddingHorizontal: 40, justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  form: { marginBottom: 20 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 9, fontWeight: "bold", marginBottom: 5, letterSpacing: 1 },
  input: {
    backgroundColor: "transparent",
    borderBottomWidth: 1.5,
    paddingVertical: 10,
    fontSize: 16,
  },
  forgotPass: { marginTop: 30, alignSelf: "center" },
  forgotText: { fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
});
