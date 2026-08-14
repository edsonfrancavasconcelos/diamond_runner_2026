// Arquivo: src/onboarding/FirstAccessScreen.js
// Diamond Runner 2026
// Configuração de senha para usuário autenticado

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
import { firstAccessTexts } from "../i18n/hooks/texts";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  success: "#2ecc71",
  gold: "#FFD700",
  dark: "#0c3c74",
  danger: "#e74c3c",
  white: "#FFFFFF",
};

export default function FirstAccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { country: contextCountry } =
    useContext(CountryContext) || {};

  const themeCtx = useTheme() || {};
  const {
    theme = {},
    toggleTheme,
    isDark = true,
  } = themeCtx;

  const country =
    route.params?.country ||
    contextCountry ||
    "BR";

  const texts =
    firstAccessTexts?.[country] ||
    firstAccessTexts?.BR ||
    {};

  const userEmail =
    route.params?.email?.trim().toLowerCase() || "";

  const idDr =
    route.params?.id_dr || "SINCRONIZANDO...";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isMinLength = password.length >= 6;
  const isMatch =
    password.length > 0 &&
    password === confirm;

  async function handleCreatePassword() {
    if (!userEmail) {
      Alert.alert(
        "Erro",
        "E-mail do usuário não foi informado."
      );
      return;
    }

    if (!isMinLength) {
      Alert.alert(
        texts.errorTitle || "Erro",
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }

    if (!isMatch) {
      Alert.alert(
        texts.errorTitle || "Erro",
        "As senhas não conferem."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANTE:
       * updateUser só funciona quando existe uma sessão
       * autenticada no Supabase.
       */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        Alert.alert(
          "Primeiro acesso",
          "Esta tela precisa ser aberta através de um fluxo de autenticação válido. Nenhuma sessão do Supabase foi encontrada."
        );
        return;
      }

      /*
       * Confere se o e-mail da sessão é o mesmo
       * usuário que está configurando a senha.
       */
      const sessionEmail =
        session.user.email?.trim().toLowerCase();

      if (sessionEmail !== userEmail) {
        Alert.alert(
          "Acesso não autorizado",
          "A sessão atual não corresponde ao usuário informado."
        );
        return;
      }

      /*
       * Agora sim podemos alterar a senha.
       */
  const { error } = await supabase.auth.signInWithPassword({
 email:userEmail,
 password:password
});


if(error){

 throw new Error(
 "Não foi possível ativar a senha."
 );

}

      /*
       * Atualiza a sessão depois da troca da senha.
       */
      const {
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      Alert.alert(
        "ACESSO LIBERADO!",
        "Sua senha foi configurada com sucesso.",
        [
          {
            text: "ENTRAR NO ESCRITÓRIO",
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
      console.error(
        "FIRST ACCESS ERROR:",
        error
      );

      Alert.alert(
        "FALHA NA SEGURANÇA",
        error?.message ||
          "Não foi possível configurar a senha."
      );
    } finally {
      setLoading(false);
    }
  }

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
          backgroundColor:
            theme.bg || PALETTE.dark,
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

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="close"
              size={28}
              color={PALETTE.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeBtn}
          >
            <Ionicons
              name={
                isDark
                  ? "sunny"
                  : "moon"
              }
              size={20}
              color={
                isDark
                  ? PALETTE.gold
                  : PALETTE.primary
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.idCard}>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>
              OFFICIAL MEMBER
            </Text>
          </View>

          <Ionicons
            name="person-circle"
            size={60}
            color={PALETTE.primary}
            style={{
              marginBottom: 10,
            }}
          />

          <Text style={styles.idLabel}>
            ID: {idDr}
          </Text>

          <Text style={styles.idEmail}>
            {userEmail}
          </Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            CONFIGURAR{"\n"}ACESSO
          </Text>

          <Text style={styles.subTitle}>
            Defina sua senha definitiva para
            proteger sua conta.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              NOVA SENHA
            </Text>

            <View
              style={[
                styles.inputBox,
                {
                  borderColor:
                    isMinLength
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

              <TouchableOpacity
                onPress={() =>
                  setShowPass(!showPass)
                }
              >
                <Ionicons
                  name={
                    showPass
                      ? "eye-off"
                      : "eye"
                  }
                  size={20}
                  color="#a4bccc"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              CONFIRMAR SENHA
            </Text>

            <View
              style={[
                styles.inputBox,
                {
                  borderColor:
                    isMatch
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
                isMatch && isMinLength
                  ? PALETTE.primary
                  : "#333",
            },
          ]}
          onPress={handleCreatePassword}
          disabled={
            loading ||
            !isMatch ||
            !isMinLength
          }
        >
          {loading ? (
            <ActivityIndicator
              color={PALETTE.white}
            />
          ) : (
            <Text style={styles.mainBtnText}>
              ATIVAR CONTA DIAMOND
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Ionicons
            name="shield-checkmark"
            size={14}
            color={PALETTE.success}
          />

          <Text style={styles.footerText}>
            Sistema de segurança Diamond Protocol
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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

  backBtn: {
    width: 45,
    height: 45,
    justifyContent: "center",
  },

  themeBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  idCard: {
    width: "100%",
    padding: 25,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 30,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: PALETTE.primary,
    backgroundColor:
      "rgba(44,148,188,0.1)",
  },

  idBadge: {
    position: "absolute",
    top: -12,
    backgroundColor:
      PALETTE.primary,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },

  idBadgeText: {
    color: PALETTE.white,
    fontSize: 10,
    fontWeight: "900",
  },

  idLabel: {
    color: PALETTE.primary,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },

  idEmail: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },

  titleSection: {
    marginBottom: 30,
  },

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

  form: {
    marginBottom: 40,
  },

  inputWrapper: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#a4bccc",
    letterSpacing: 1,
    marginBottom: 8,
  },

  inputBox: {
    height: 60,
    backgroundColor:
      "rgba(255,255,255,0.03)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  textInput: {
    flex: 1,
    color: PALETTE.white,
    marginLeft: 12,
    fontSize: 16,
  },

  mainBtn: {
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  mainBtnText: {
    color: PALETTE.white,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  footerText: {
    color: "#a4bccc",
    fontSize: 11,
    marginLeft: 8,
  },
});