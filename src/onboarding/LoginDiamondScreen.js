// Autor: Edson Vasconcelos | Diamond Runner 2026
// Correção: Login Híbrido + Lógica Inteligente de Primeiro Acesso

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useContext, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
import { commonTexts, loginTexts } from "../i18n/hooks/texts";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  grayBlue: "#647c9c",
  softGray: "#a4bccc",
};

export default function LoginDiamondScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const countryCtx = useContext(CountryContext);
  const themeCtx = useTheme();

  const country = countryCtx?.country || "BR";
  const { isDark } = themeCtx || { isDark: true };

  const theme = {
    bg: isDark ? PALETTE.dark : "#F5F5F7",
    text: isDark ? "#FFFFFF" : PALETTE.dark,
    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    border: isDark ? PALETTE.grayBlue : PALETTE.softGray,
  };

  const texts = loginTexts[country] || loginTexts.BR || {};
  const common = commonTexts[country] || commonTexts.BR;

  const [loginInput, setLoginInput] = useState(route.params?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AJUSTE NA BUSCA DO PRIMEIRO ACESSO (Mudei .document para .document_id)
  async function handleFirstAccess() {
    const inputClean = loginInput.trim();
    if (!inputClean) {
      Alert.alert(texts.requiredTitle, texts.requiredIdentification);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, id_dr, status")
        .or(
          `id_dr.eq.${inputClean.toUpperCase()},document_id.eq.${inputClean},email.eq.${inputClean.toLowerCase()}`,
        )
        .maybeSingle();

      if (error || !data) throw new Error(texts.accountNotFound);

      navigation.navigate("FirstAccess", {
        email: data.email,
        id_dr: data.id_dr,
      });
    } catch {
      Alert.alert(texts.attentionTitle, texts.accountNotFound);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    const inputClean = loginInput.trim();
    if (!inputClean || !password) {
      Alert.alert(common.error, texts.missingFields);
      return;
    }

    setLoading(true);
    try {
      let finalEmail = inputClean.toLowerCase();

      // Se não for e-mail, busca o e-mail real vinculado ao ID ou CPF
      if (!finalEmail.includes("@")) {
        const { data, error: searchError } = await supabase
          .from("profiles")
          .select("email")
          .or(
            `id_dr.eq.${inputClean.toUpperCase()},document_id.eq.${inputClean}`,
          )
          .maybeSingle();

        if (searchError || !data?.email)
          throw new Error(texts.idOrCpfNotFound);
        finalEmail = data.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (authError)
        throw new Error(texts.invalidPassword);
    } catch (err) {
      Alert.alert(
        texts.accessFailure,
        err.message === texts.idOrCpfNotFound
          ? texts.idOrCpfNotFound
          : texts.loginFailedMessage,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
        </View>

        <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {texts.titlePortal}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? PALETTE.softGray : "#535355" },
          ]}
        >
          {texts.accountSubtitle}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: PALETTE.primary }]}>
              {texts.identificationLabel}
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: theme.border, color: theme.text },
              ]}
              placeholder={texts.identificationPlaceholder}
              placeholderTextColor={isDark ? "#555" : "#999"}
              value={loginInput}
              onChangeText={setLoginInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: PALETTE.primary }]}>
              {texts.passwordLabel}
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: theme.border, color: theme.text },
              ]}
              placeholder="••••••••"
              placeholderTextColor={isDark ? "#555" : "#999"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          title={loading ? texts.processing : texts.enterButton.toUpperCase()}
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: PALETTE.primary,
            height: 58,
            borderRadius: 16,
          }}
          textStyle={{ color: "#FFF", fontWeight: "bold" }}
        />

        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text
              style={[
                styles.linkText,
                { color: isDark ? PALETTE.grayBlue : "#999" },
              ]}
            >
              {texts.forgotPasswordButton}
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.dotSeparator, { backgroundColor: theme.border }]}
          />

          <TouchableOpacity onPress={handleFirstAccess}>
            <Text style={[styles.linkText, { color: PALETTE.primary }]}>
              {texts.firstAccess.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  content: { flexGrow: 1, paddingHorizontal: 40, justifyContent: "center" },
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
  },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 30 },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 1,
  },
  input: { borderBottomWidth: 1.5, paddingVertical: 12, fontSize: 16 },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  linkText: { fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 15 },
});
