// Autor: Edson Vasconcelos | Diamond Runner 2026
// Arquivo: src/onboarding/SponsorDataScreen.js
// Estilo: Nova Paleta Blue Diamond 2026

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
  View,
} from "react-native";

import Button from "../components/Button";
import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { hasSponsorTexts } from "../i18n/hooks/texts";
import { supabase } from "../services/supabase";

// NOVA PALETA 2026
const PALETTE = {
  primary: "#2c94bc", // color1
  light: "#bcdcf4", // color2
  dark: "#0c3c74", // color3
  grayBlue: "#647c9c", // color4
  softGray: "#a4bccc", // color5
};

export default function SponsorDataScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { country } = useContext(CountryContext);

  const texts = hasSponsorTexts[country] || hasSponsorTexts.BR;

  const [sponsorName, setSponsorName] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [loading, setLoading] = useState(false);
// Dentro da função handleContinue
async function handleContinue() {
  if (!sponsorId.trim()) return;

  setLoading(true);
  try {
    // Buscamos na tabela PROFILES (mesma tabela)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, id_dr, full_name") // Pegamos o 'id' (UUID) também!
      .eq("id_dr", sponsorId.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      throw new Error("ID de Patrocinador não encontrado no sistema Diamond.");
    }

 
    navigation.navigate("RunnerRegister", {
      sponsorUuid: data.id,    
      sponsorId: data.id_dr,    
      sponsorName: data.full_name,
    });
  } catch (error) {
    Alert.alert("Verificação", error.message);
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

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {texts.title?.toUpperCase() || "DADOS DO PATROCINADOR"}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? PALETTE.softGray : "#999" },
          ]}
        >
          {texts.subtitle}
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: PALETTE.primary }]}>
            {(
              texts.labelFullName ||
              (country === "BR"
                ? "NOME COMPLETO"
                : country === "ES"
                  ? "NOMBRE COMPLETO"
                  : "FULL NAME")
            ).toUpperCase()}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder={texts.sponsorNamePlaceholder || "Nome do patrocinador"}
            placeholderTextColor={isDark ? "#444" : "#ccc"}
            value={sponsorName}
            onChangeText={setSponsorName}
            selectionColor={PALETTE.primary}
          />

          <Text style={[styles.label, { color: PALETTE.primary }]}>
            {(
              texts.labelSponsorId ||
              (country === "BR"
                ? "CÓDIGO DE IDENTIFICAÇÃO (ID)"
                : country === "ES"
                  ? "CÓDIGO DE IDENTIFICACIÓN"
                  : "IDENTIFICATION CODE")
            ).toUpperCase()}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: PALETTE.primary,
                color: theme.text,
              },
              { borderBottomWidth: 3 },
            ]}
            placeholder={texts.sponsorIdPlaceholder || "DR0000"}
            placeholderTextColor={isDark ? "#444" : "#ccc"}
            value={sponsorId}
            onChangeText={setSponsorId}
            autoCapitalize="characters"
            selectionColor={PALETTE.primary}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.flexButton}>
            <Button
              title={texts.back?.toUpperCase() || "VOLTAR"}
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{
                borderColor: PALETTE.primary,
                height: 55,
                borderRadius: 14,
              }}
              textStyle={{ color: isDark ? "#FFF" : PALETTE.primary }}
            />
          </View>
          <View style={{ width: 15 }} />
          <View style={styles.flexButton}>
            <Button
              title={
                loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  texts.continue?.toUpperCase() || "CONTINUAR"
                )
              }
              onPress={handleContinue}
              disabled={!sponsorName || !sponsorId || loading}
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 35, justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 12, textAlign: "center", marginBottom: 50 },
  form: { marginBottom: 20 },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 25,
    borderRadius: 14,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  flexButton: { flex: 1 },
});
