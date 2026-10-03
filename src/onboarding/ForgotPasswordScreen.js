// Arquivo: src/onboarding/ForgotPasswordScreen.js
// Atualizado em 26 de Jan 2026 com a Nova Paleta Blue Diamond
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CountryContext } from "../i18n/context/CountryContext";
import { supabase } from "../services/supabase";
import { useTheme } from "../i18n/context/ThemeContext";
import { forgotPasswordTexts } from "../i18n/hooks/texts";
import Button from "../components/Button";
import { isValidEmail } from "../utils/inputValidation";

// NOVA PALETA 2026
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { country } = useContext(CountryContext) || {};
  const texts = forgotPasswordTexts[country] || forgotPasswordTexts.BR;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!isValidEmail(email)) {
      Alert.alert(texts.errorTitle, texts.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "diamondrunner://reset-password",
        },
      );

      if (error) throw error;

      Alert.alert(
        texts.successTitle,
        texts.successMessage,
        [{ text: texts.ok, onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(texts.errorTitle, texts.unexpectedError);
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons name="chevron-back" size={24} color={PALETTE.primary} />
          </TouchableOpacity>
          <Image
            source={require("../assets/images/logodiamond.png")}
            style={{ width: 38, height: 38, marginTop: 50 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {texts.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? PALETTE.softGray : "#8E8E93" },
            ]}
          >
            {texts.subtitle}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: PALETTE.primary }]}>
              {texts.emailLabel}
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: theme.border, color: theme.text },
              ]}
              placeholder={texts.emailPlaceholder}
              placeholderTextColor={isDark ? "#444" : "#999"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Button
            title={loading ? texts.sending : texts.sendLink}
            onPress={handleReset}
            disabled={loading}
            style={{
              backgroundColor: PALETTE.primary,
              height: 55,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
            }}
            textStyle={{ color: "#FFF", fontWeight: "bold" }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  backBtn: {
    marginTop: 50,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  content: { flexGrow: 1, justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  inputGroup: { marginBottom: 40 },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: { borderBottomWidth: 1.5, paddingVertical: 12, fontSize: 16 },
});
