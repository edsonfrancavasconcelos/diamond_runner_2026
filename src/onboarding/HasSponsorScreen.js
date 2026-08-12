// Arquivo: src/onboarding/HasSponsorScreen.js
// Diamond Runner 2026
// Validação do patrocinador antes do cadastro

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
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
import { hasSponsorTexts } from "../i18n/hooks/texts";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  softGray: "#a4bccc",
  gold: "#FFD700",
};

export default function HasSponsorScreen() {
  const navigation = useNavigation();

  const { country } = useContext(CountryContext);
  const { theme, toggleTheme, isDark } = useTheme();

  const texts =
    hasSponsorTexts?.[country] ||
    hasSponsorTexts?.BR ||
    {};

  const [sponsorId, setSponsorId] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // VALIDAR PATROCINADOR
  // ============================================================
  async function handleContinue() {
    const idFormatado = sponsorId.trim().toUpperCase();

    if (!idFormatado) {
      Alert.alert(
        "ID OBRIGATÓRIO",
        "Digite o ID do seu patrocinador."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("🔎 Procurando patrocinador:", idFormatado);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, id_dr")
        .eq("id_dr", idFormatado)
        .maybeSingle();

      // ========================================================
      // ERRO NA CONSULTA
      // ========================================================
      if (error) {
        console.log("❌ Erro Supabase:", error);

        throw new Error(
          "Não foi possível validar o patrocinador. Tente novamente."
        );
      }

      // ========================================================
      // PATROCINADOR NÃO EXISTE
      // ========================================================
      if (!data) {
        throw new Error(
          "Patrocinador não encontrado. Verifique o ID digitado."
        );
      }

      console.log("✅ Patrocinador encontrado:", data);

      // ========================================================
      // NAVEGA PARA O CADASTRO
      //
      // IMPORTANTE:
      // RunnerRegisterScreen espera:
      //
      // sponsorUuid
      // sponsorId
      // sponsorName
      //
      // Por isso usamos EXATAMENTE esses nomes.
      // ========================================================
      navigation.navigate("RunnerRegister", {
        country: country,

        sponsorUuid: data.id,

        sponsorId: data.id_dr || idFormatado,

        sponsorName: data.full_name || "PATROCINADOR",
      });

    } catch (error) {
      console.log("❌ Erro ao validar patrocinador:", error);

      Alert.alert(
        "ERRO DE VALIDAÇÃO",
        error?.message ||
          "Não foi possível validar o patrocinador."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

      {/* ======================================================
          HEADER
      ====================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={PALETTE.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={toggleTheme}
          disabled={loading}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={22}
            color={
              isDark
                ? PALETTE.gold
                : PALETTE.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}
      <View style={styles.content}>

        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          VALIDAÇÃO DE REDE
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: PALETTE.softGray,
            },
          ]}
        >
          Insira o ID de quem te convidou para o time Diamond.
        </Text>

        {/* ==================================================
            CAMPO DO PATROCINADOR
        ================================================== */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>

            <Text
              style={[
                styles.label,
                {
                  color: PALETTE.primary,
                },
              ]}
            >
              ID DO PATROCINADOR
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderBottomColor:
                    PALETTE.primary,
                  color: theme.text,
                },
              ]}
              placeholder="Ex: DR-1000"
              placeholderTextColor="#4b4b4b"
              value={sponsorId}
              onChangeText={(value) =>
                setSponsorId(
                  value
                    .toUpperCase()
                    .replace(/\s/g, "")
                )
              }
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              selectionColor={PALETTE.primary}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

          </View>
        </View>

        {/* ==================================================
            BOTÃO
        ================================================== */}
        <Button
          title={
            loading
              ? "VERIFICANDO..."
              : "CONTINUAR"
          }
          onPress={handleContinue}
          disabled={
            loading ||
            !sponsorId.trim()
          }
          style={{
            backgroundColor:
              sponsorId.trim()
                ? PALETTE.primary
                : "#444",
            height: 55,
            borderRadius: 14,
          }}
        />

        {/* ==================================================
            LOADING
        ================================================== */}
        {loading && (
          <ActivityIndicator
            style={{
              marginTop: 20,
            }}
            color={PALETTE.primary}
            size="small"
          />
        )}

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
    alignItems: "center",
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
  },

  content: {
    flex: 1,
    paddingHorizontal: 35,
    justifyContent: "center",
  },

  title: {
    fontSize: 14,
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
  },

  input: {
    borderBottomWidth: 1.5,
    paddingVertical: 12,
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },
});