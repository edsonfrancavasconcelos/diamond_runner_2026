// Arquivo: src/onboarding/HasSponsorScreen.js
// Autor: Edson Vasconcelos | Atualizado em Fev 2026 - Corrigido

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
};

export default function HasSponsorScreen() {
  const navigation = useNavigation();
  const { country } = useContext(CountryContext);
  const { theme, toggleTheme, isDark } = useTheme();
  const texts = hasSponsorTexts?.[country] || hasSponsorTexts?.BR || {};

  const [sponsorId, setSponsorId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FUNÇÃO DE CONTINUAR CORRIGIDA (O AWAIT SÓ PODE FICAR AQUI DENTRO)
  async function handleContinue() {
    if (!sponsorId.trim()) return;
    
    setLoading(true);
    try {
      // Força Maiúsculas e remove espaços (Ex: dr-1000 vira DR-1000)
      const idFormatado = sponsorId.trim().toUpperCase(); 

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id_dr', idFormatado)
        .single();

      if (error || !data) {
        throw new Error("Patrocinador não encontrado. Verifique o ID digitado.");
      }

      // SE ACHOU, NAVEGA PARA O REGISTRO
      navigation.navigate("RunnerRegister", {
        country,
        sponsorUuid: data.id, 
        sponsorName: data.full_name,
        sponsorIdDr: idFormatado
      });

    } catch (error) {
      Alert.alert("ERRO DE VALIDAÇÃO", error.message);
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

      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={PALETTE.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={toggleTheme}>
          <Ionicons 
            name={isDark ? "sunny" : "moon"} 
            size={22} 
            color={isDark ? "#FFD700" : PALETTE.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>VALIDAÇÃO DE REDE</Text>
        <Text style={[styles.subtitle, { color: PALETTE.softGray }]}>
          Insira o ID de quem te convidou para o time Diamond.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: PALETTE.primary }]}>ID DO PATROCINADOR</Text>
            <TextInput
              style={[styles.input, { borderBottomColor: PALETTE.primary, color: theme.text }]}
              placeholder="Ex: DR-1000"
              placeholderTextColor="#4b4b4b"
              value={sponsorId}
              onChangeText={setSponsorId}
              autoCapitalize="characters"
              selectionColor={PALETTE.primary}
            />
          </View>
        </View>

        <Button
          title={loading ? "VERIFICANDO..." : "CONTINUAR"}
          onPress={handleContinue}
          disabled={loading || !sponsorId}
          style={{
            backgroundColor: sponsorId ? PALETTE.primary : "#444",
            height: 55,
            borderRadius: 14,
          }}
        />

        {loading && <ActivityIndicator style={{marginTop: 20}} color={PALETTE.primary} />}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 25, 
    paddingTop: 60 
  },
  navButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  content: { flex: 1, paddingHorizontal: 35, justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "900", letterSpacing: 4, textAlign: "center" },
  subtitle: { fontSize: 12, textAlign: "center", marginTop: 12, marginBottom: 50 },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  input: { borderBottomWidth: 1.5, paddingVertical: 12, fontSize: 22, textAlign: 'center', fontWeight: 'bold' },
});
