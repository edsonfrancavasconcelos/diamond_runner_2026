// Autor: Edson Vasconcelos | Diamond Runner 2026
// Login Diamond - Supabase Auth + Profiles
// Compatível com a estrutura atual da tabela profiles

import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
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
import { loginTexts } from "../i18n/hooks/texts";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  grayBlue: "#647c9c",
  softGray: "#a4bccc",
};

export default function LoginDiamondScreen() {
  const navigation = useNavigation();

  const countryCtx = useContext(CountryContext);
  const themeCtx = useTheme();

  const country = countryCtx?.country || "BR";

  const {
    toggleTheme,
    isDark = true,
  } = themeCtx || {};

  const theme = {
    bg: isDark ? PALETTE.dark : "#F5F5F7",
    text: isDark ? "#FFFFFF" : PALETTE.dark,
    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.03)",
    border: isDark
      ? PALETTE.grayBlue
      : PALETTE.softGray,
  };

  // Mantido para não quebrar a estrutura de internacionalização
  const texts = loginTexts[country] || loginTexts.BR || {};

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // NORMALIZAÇÃO
  // ============================================================

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function normalizeId(value) {
    return value.trim().toUpperCase();
  }

  function normalizeDocument(value) {
    return value.replace(/\D/g, "");
  }

  // ============================================================
  // PRIMEIRO ACESSO
  // ============================================================

  async function handleFirstAccess() {
    // Placeholder – implemente a navegação/fluxo de primeiro acesso aqui
    navigation.navigate("FirstAccess");
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async function handleLogin() {
    const input = loginInput.trim();

    if (!input || !password) {
      Alert.alert(
        "Erro",
        "Preencha identificação e senha."
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      let emailFinal = "";

      // LOGIN POR EMAIL
      if (input.includes("@")) {
        emailFinal = input.toLowerCase();
      }
      // LOGIN POR ID_DR
      else {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("id_dr", input.toUpperCase())
          .maybeSingle();

        if (error) {
          console.log("ERRO BUSCA ID:", error);
          throw new Error("Erro ao localizar usuário.");
        }

        if (!profile?.email) {
          throw new Error("Usuário não encontrado.");
        }

        emailFinal = profile.email.toLowerCase();
      }

      console.log("LOGIN COM:", emailFinal);

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: emailFinal,
          password: password,
        });

      if (authError) {
        console.log("SUPABASE AUTH ERROR:", authError);
        throw new Error("Senha incorreta.");
      }

      if (!data.session) {
        throw new Error("Sessão não criada.");
      }

      // busca perfil depois do login
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, status, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Usuário inativo.");
      }

      if (
        profile?.status &&
        profile.status.toUpperCase() !== "ATIVO"
      ) {
        await supabase.auth.signOut();
        throw new Error("Seu cadastro não está ativo.");
      }

      Alert.alert(
        "Acesso autorizado",
        `Bem-vindo ${profile?.full_name || ""}`,
        [
          {
            text: "CONTINUAR",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "OfficeDrawer",
                    },
                  ],
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      console.log("ERRO LOGIN FINAL:", error);

      Alert.alert(
        "Falha de acesso",
        error.message || "Não foi possível entrar na conta."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
        },
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={() =>
            navigation.goBack()
          }
          disabled={loading}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={PALETTE.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={toggleTheme}
          disabled={loading}
        >
          <Ionicons
            name={
              isDark
                ? "sunny"
                : "moon"
            }
            size={22}
            color={
              isDark
                ? "#FFD700"
                : PALETTE.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO */}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          PORTAL DIAMOND
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: isDark
                ? PALETTE.softGray
                : "#535355",
            },
          ]}
        >
          Acesse sua conta executiva
        </Text>

        {/* FORMULÁRIO */}

        <View style={styles.form}>
          {/* IDENTIFICAÇÃO */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: PALETTE.primary,
                },
              ]}
            >
              IDENTIFICAÇÃO
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderBottomColor:
                    theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="E-mail, ID ou CPF"
              placeholderTextColor={
                isDark
                  ? "#777"
                  : "#999"
              }
              value={loginInput}
              onChangeText={
                setLoginInput
              }
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              keyboardType={
                loginInput.includes("@")
                  ? "email-address"
                  : "default"
              }
              editable={!loading}
              returnKeyType="next"
            />
          </View>

          {/* SENHA */}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: PALETTE.primary,
                },
              ]}
            >
              SENHA
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderBottomColor:
                    theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Digite sua senha"
              placeholderTextColor={
                isDark
                  ? "#777"
                  : "#999"
              }
              value={password}
              onChangeText={
                setPassword
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={
                handleLogin
              }
            />
          </View>
        </View>

        {/* ENTRAR */}

        <Button
          title={
            loading
              ? "PROCESSANDO..."
              : "ENTRAR"
          }
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor:
              PALETTE.primary,
            height: 58,
            borderRadius: 16,
          }}
          textStyle={{
            color: "#FFF",
            fontWeight: "bold",
          }}
        />

        {/* LINKS */}

        <View
          style={styles.footerLinks}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "ForgotPassword"
              )
            }
            disabled={loading}
          >
            <Text
              style={[
                styles.linkText,
                {
                  color: isDark
                    ? PALETTE.grayBlue
                    : "#777",
                },
              ]}
            >
              ESQUECI SENHA
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.dotSeparator,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />

          <TouchableOpacity
            onPress={
              handleFirstAccess
            }
            disabled={loading}
          >
            <Text
              style={[
                styles.linkText,
                {
                  color:
                    PALETTE.primary,
                },
              ]}
            >
              PRIMEIRO ACESSO
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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

  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
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
  },

  form: {
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 30,
  },

  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 1,
  },

  input: {
    borderBottomWidth: 1.5,
    paddingVertical: 12,
    fontSize: 16,
  },

  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  linkText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 15,
  },
});