// Arquivo: src/onboarding/FirstAccessScreen.js
// Diamond Runner 2026
// Fluxo: identificar sócio → definir senha via backend

import { Ionicons } from "@expo/vector-icons";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
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

import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  success: "#2ecc71",
  gold: "#FFD700",
  dark: "#0c3c74",
  white: "#FFFFFF",
};

// Mesmo IP do PaymentScreen — ajuste se mudar a rede
const API_URL = "http://192.168.18.111:3333/api";

export default function FirstAccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { country: contextCountry } = useContext(CountryContext) || {};
  const themeCtx = useTheme() || {};
  const { theme = {}, toggleTheme, isDark = true } = themeCtx;

  const prefill =
    route.params?.prefill ||
    route.params?.email ||
    route.params?.idDr ||
    "";

  // etapa: "identify" | "password"
  const [step, setStep] = useState(
    route.params?.email || route.params?.idDr ? "password" : "identify",
  );
  const [identifier, setIdentifier] = useState(prefill);
  const [profile, setProfile] = useState(
    route.params?.email
      ? {
          email: route.params.email,
          id_dr: route.params.idDr || route.params.id_dr || "",
          full_name: route.params.fullName || "",
        }
      : null,
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isMinLength = password.length >= 6;
  const isMatch = password.length > 0 && password === confirm;

  // ============================================================
  // ETAPA 1 — localizar o sócio no Supabase (profiles)
  // ============================================================
  async function handleIdentify() {
    const input = identifier.trim();

    if (!input) {
      Alert.alert("Erro", "Informe seu e-mail ou ID Diamond (ex: DR000002).");
      return;
    }

    setLoading(true);

    try {
      await supabase.auth.signOut();

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, id_dr, status, is_active");

      if (input.includes("@")) {
        query = query.eq("email", input.toLowerCase());
      } else {
        query = query.eq("id_dr", input.toUpperCase());
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.log("ERRO BUSCA PERFIL:", error);
        throw new Error("Erro ao localizar cadastro.");
      }

      if (!data) {
        throw new Error("Cadastro não encontrado. Verifique o e-mail ou ID.");
      }

      if (data.is_active === false) {
        throw new Error("Este cadastro está inativo.");
      }

      if (data.status && String(data.status).toUpperCase() !== "ATIVO") {
        throw new Error("Este cadastro ainda não está ativo.");
      }

      if (!data.email) {
        throw new Error("Cadastro sem e-mail. Contate o suporte.");
      }

      setProfile(data);
      setStep("password");
    } catch (err) {
      console.log("IDENTIFY ERROR:", err);
      Alert.alert(
        "Primeiro acesso",
        err.message || "Não foi possível localizar.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ETAPA 2 — definir senha via BACKEND
  // ============================================================
  async function handleCreatePassword() {
    if (!profile?.email && !profile?.id_dr) {
      Alert.alert("Erro", "Perfil inválido. Volte e identifique-se novamente.");
      return;
    }

    if (!isMinLength) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!isMatch) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Definindo senha via backend...", {
        email: profile.email,
        id_dr: profile.id_dr,
      });

      const response = await fetch(`${API_URL}/auth/first-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          id_dr: profile.id_dr,
          password: password,
        }),
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      console.log("📥 first-password status:", response.status, result);

      if (!response.ok || result?.status !== "success") {
        throw new Error(
          result?.message ||
            `Não foi possível definir a senha (${response.status}).`,
        );
      }

      const loginEmail = (result.email || profile.email || "")
        .trim()
        .toLowerCase();

      if (!loginEmail) {
        throw new Error("E-mail não retornado pelo servidor.");
      }

      // Login com a senha recém definida
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password,
        });

      if (signInError) {
        console.log("SIGNIN ERROR:", signInError);
        throw new Error(
          "Senha definida, mas o login falhou. Tente entrar pelo login normal.",
        );
      }

      if (!signInData?.session) {
        throw new Error("Sessão não criada. Tente entrar pelo login.");
      }

      Alert.alert(
        "ACESSO LIBERADO!",
        `Bem-vindo${profile.full_name ? `, ${profile.full_name}` : ""}!`,
        [
          {
            text: "ENTRAR NO ESCRITÓRIO",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "OfficeDrawer" }],
                }),
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error("FIRST ACCESS ERROR:", error);

      const msg = error?.message || "Não foi possível configurar a senha.";

      if (
        msg.toLowerCase().includes("network request failed") ||
        msg.toLowerCase().includes("network error")
      ) {
        Alert.alert(
          "SERVIDOR INDISPONÍVEL",
          "Não foi possível conectar ao Diamond Backend.\n\nVerifique se o backend está rodando e se o IP está correto:\n\n" +
            API_URL,
        );
      } else {
        Alert.alert("Falha no primeiro acesso", msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg || PALETTE.dark }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step === "password" && !route.params?.email) {
                setStep("identify");
                setPassword("");
                setConfirm("");
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backBtn}
          >
            <Ionicons name="close" size={28} color={PALETTE.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={20}
              color={isDark ? PALETTE.gold : PALETTE.primary}
            />
          </TouchableOpacity>
        </View>

        {step === "identify" ? (
          <>
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>PRIMEIRO{"\n"}ACESSO</Text>
              <Text style={styles.subTitle}>
                Informe seu e-mail ou ID Diamond para localizar seu cadastro.
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-MAIL OU ID DIAMOND</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={PALETTE.primary}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="ex: DR000002 ou seu@email.com"
                  placeholderTextColor="#666"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleIdentify}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.mainBtn,
                {
                  backgroundColor: identifier.trim()
                    ? PALETTE.primary
                    : "#333",
                },
              ]}
              onPress={handleIdentify}
              disabled={loading || !identifier.trim()}
            >
              {loading ? (
                <ActivityIndicator color={PALETTE.white} />
              ) : (
                <Text style={styles.mainBtnText}>LOCALIZAR CADASTRO</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.idCard}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>OFFICIAL MEMBER</Text>
              </View>

              <Ionicons
                name="person-circle"
                size={60}
                color={PALETTE.primary}
                style={{ marginBottom: 10 }}
              />

              <Text style={styles.idLabel}>
                ID: {profile?.id_dr || "—"}
              </Text>
              <Text style={styles.idName}>{profile?.full_name || ""}</Text>
              <Text style={styles.idEmail}>{profile?.email || ""}</Text>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>CONFIGURAR{"\n"}SENHA</Text>
              <Text style={styles.subTitle}>
                Defina sua senha definitiva para acessar o portal.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>NOVA SENHA</Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      borderColor: isMinLength
                        ? PALETTE.success
                        : "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={PALETTE.primary}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons
                      name={showPass ? "eye-off" : "eye"}
                      size={20}
                      color="#a4bccc"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>CONFIRMAR SENHA</Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      borderColor: isMatch
                        ? PALETTE.success
                        : "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={PALETTE.primary}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#666"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.mainBtn,
                {
                  backgroundColor:
                    isMatch && isMinLength ? PALETTE.primary : "#333",
                },
              ]}
              onPress={handleCreatePassword}
              disabled={loading || !isMatch || !isMinLength}
            >
              {loading ? (
                <ActivityIndicator color={PALETTE.white} />
              ) : (
                <Text style={styles.mainBtnText}>ATIVAR CONTA DIAMOND</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark" size={14} color={PALETTE.success} />
          <Text style={styles.footerText}>
            Sistema de segurança Diamond Protocol
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  backBtn: { width: 45, height: 45, justifyContent: "center" },
  themeBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  idCard: {
    width: "100%",
    padding: 25,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: PALETTE.primary,
    backgroundColor: "rgba(44,148,188,0.1)",
  },
  idBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: PALETTE.primary,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: { color: PALETTE.white, fontSize: 10, fontWeight: "900" },
  idLabel: {
    color: PALETTE.primary,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  idName: { color: PALETTE.white, fontSize: 15, fontWeight: "600" },
  idEmail: {
    color: PALETTE.white,
    fontSize: 13,
    opacity: 0.75,
    marginTop: 4,
  },
  titleSection: { marginBottom: 28, marginTop: 10 },
  mainTitle: {
    color: PALETTE.white,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  subTitle: {
    color: "#a4bccc",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  form: { marginBottom: 30 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: {
    color: PALETTE.primary,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  textInput: {
    flex: 1,
    color: PALETTE.white,
    fontSize: 16,
    marginHorizontal: 12,
  },
  mainBtn: {
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mainBtnText: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  footerNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 8,
  },
  footerText: { color: "#a4bccc", fontSize: 11 },
});