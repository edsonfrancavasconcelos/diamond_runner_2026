// Arquivo: src/onboarding/RunnerRegisterScreen.js
// Diamond Runner 2026 - FIXED: AUTO-FILL NO RE-TYPE

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView, Linking, Platform, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator
} from "react-native";

import Button from "../components/Button";
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBlue: "#0c3c74"
};

export default function RunnerRegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  
  // 1. RECEBE OS DADOS DA TELA DE VALIDAÇÃO
  const { sponsorUuid, sponsorId, sponsorName, planName, type } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [isValidatingSponsor, setIsValidatingSponsor] = useState(false);
  const [registered, setRegistered] = useState(false);

  // 2. O ESTADO JÁ NASCE COM OS DADOS DO PATROCINADOR
  const [form, setForm] = useState({
    sponsorId: sponsorId || "",
    sponsorName: sponsorName || "", 
    sponsorUuid: sponsorUuid || "",
    fullName: "",
    email: "",
    documentId: "",
    birth: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const createPendingAccount = async () => {
    if (loading) return;
    if (!form.fullName.trim() || !form.documentId.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.confirmPassword) {
      Alert.alert("Dados incompletos", "Preencha nome, CPF, e-mail, WhatsApp, senha e confirmação de senha.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Senha inválida", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Senha inválida", "As senhas não conferem.");
      return;
    }
    if (!form.sponsorUuid || form.sponsorName.includes("❌")) {
      Alert.alert("Patrocinador inválido", "Selecione um patrocinador válido antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanDocument = form.documentId.replace(/\D/g, "");
      const cleanPhone = form.phone.replace(/\D/g, "");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            document_id: cleanDocument,
            whatsapp: cleanPhone,
            sponsor_id: form.sponsorUuid,
            plan_name: planName || type || "",
            status: "PENDING",
            is_active: false,
          },
        },
      });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (!userId) throw new Error("Não foi possível criar a conta.");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: form.fullName.trim(),
        document_id: cleanDocument,
        email: cleanEmail,
        whatsapp: cleanPhone,
        sponsor_id: form.sponsorUuid,
        status: "PENDING",
        is_active: false,
        id_dr: null,
      }, { onConflict: "id" });
          if (profileError) throw profileError;

      navigation.navigate("PaymentScreen", {
        email: cleanEmail,
        fullName: form.fullName.trim(),
        documentId: cleanDocument,
        phone: cleanPhone,
        type: planName || type || "",
        planName: planName || type || "",
        sponsorUuid: form.sponsorUuid,
        sponsorId: form.sponsorId,
        sponsorName: form.sponsorName,
      });
    } catch (error) {
      Alert.alert("Não foi possível cadastrar", error.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const paymentLinks = {
    AFILIADO: "https://buy.stripe.com/aFa6oHaxL6bN5td5jaa3u08",
    DISTRIBUIDOR: "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    BUILDER: "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    PRIME: "https://buy.stripe.com/8x24gzcFTas34p98vma3u0a",
    ELITE: "https://buy.stripe.com/aFafZh35j57JaNxbHya3u0b",
  };

  const openStripe = () => {
    const plan = `${planName || type || ""}`.toLowerCase();
    const planKey = plan.includes("elite")
      ? "ELITE"
      : plan.includes("prime")
        ? "PRIME"
        : plan.includes("builder") || plan.includes("distributor") || plan.includes("distribuidor")
          ? "BUILDER"
          : "AFILIADO";
    const link = paymentLinks[planKey];
    const cleanEmail = form.email.trim().toLowerCase();
    const separator = link.includes("?") ? "&" : "?";
    const url = `${link}${separator}prefilled_email=${encodeURIComponent(cleanEmail)}`;
    if (typeof window !== "undefined" && window.open) {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  // 3. BUSCA SÓ DISPARA SE O USUÁRIO REALMENTE MUDAR O ID MANUALMENTE
  useEffect(() => {
    // Se o ID for igual ao que veio da validação, não faz busca nenhuma (evita o "aguardando")
    if (form.sponsorId === sponsorId) return;

    const searchSponsor = async () => {
      const id = form.sponsorId.trim().toUpperCase();
      if (id.length < 4) return;

      setIsValidatingSponsor(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id_dr", id)
        .maybeSingle();

      if (!error && data) {
        setForm(prev => ({ ...prev, sponsorName: data.full_name.toUpperCase(), sponsorUuid: data.id }));
      } else {
        setForm(prev => ({ ...prev, sponsorName: "NÃO ENCONTRADO ❌", sponsorUuid: "" }));
      }
      setIsValidatingSponsor(false);
    };

    const debounce = setTimeout(searchSponsor, 1000);
    return () => clearTimeout(debounce);
  }, [form.sponsorId, sponsorId]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color={PALETTE.primary} /></TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>FINALIZAR CADASTRO 2</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CARD DO PATROCINADOR: APARECE AUTOMÁTICO */}
        <View style={[styles.sponsorHeader, { backgroundColor: isDark ? PALETTE.darkBlue : '#e1f0f7' }]}>
          <Ionicons name="shield-checkmark" size={32} color={PALETTE.gold} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: '#a4bccc', fontSize: 10, fontWeight: 'bold' }}>PATROCINADOR SELECIONADO:</Text>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>
              {form.sponsorName || "BUSCANDO..."}
            </Text>
            <Text style={{ color: PALETTE.primary, fontSize: 12, fontWeight: 'bold' }}>ID: {form.sponsorId}</Text>
          </View>
          {isValidatingSponsor && <ActivityIndicator size="small" color={PALETTE.gold} />}
        </View>

        <Text style={styles.sectionTitle}>SEUS DADOS PESSOAIS</Text>
        <InputField label="NOME COMPLETO *" value={form.fullName} onChange={(v) => updateForm("fullName", v)} />
        <InputField label="CPF *" value={form.documentId} keyboard="numeric" onChange={(v) => updateForm("documentId", v)} />
        <InputField label="E-MAIL *" value={form.email} keyboard="email-address" onChange={(v) => updateForm("email", v)} />
        <InputField label="WHATSAPP *" value={form.phone} keyboard="phone-pad" onChange={(v) => updateForm("phone", v)} />
        <InputField label="SENHA *" value={form.password} secure onChange={(v) => updateForm("password", v)} />
        <InputField label="CONFIRMAR SENHA *" value={form.confirmPassword} secure onChange={(v) => updateForm("confirmPassword", v)} />

        {/* CAMPO DE ALTERAÇÃO (CASO PRECISE MUDAR O ID) */}
        <TouchableOpacity style={{marginTop: 10}} onPress={() => {/* focar input se quiser */}}>
            <Text style={{color: '#a4bccc', fontSize: 11}}>Deseja trocar o patrocinador? Altere o ID abaixo:</Text>
        </TouchableOpacity>
        <InputField
          label=""
          value={form.sponsorId}
          onChange={(v) => updateForm("sponsorId", v.toUpperCase())}
        />

        {!registered ? (
          <Button
            title={loading ? "CRIANDO CONTA..." : "CONFIRMAR CADASTRO"}
            onPress={createPendingAccount}
            disabled={loading || !form.sponsorUuid || form.sponsorName.includes("❌")}
          />
        ) : (
          <>
            <Text style={styles.pendingMessage}>
              Conta criada. Sem pagamento fica PENDENTE e sem ID DR.
            </Text>
            <Button
              title="IR PARA PAGAMENTO"
              onPress={openStripe}
            />
            <Button
              title="CONFIRMAR CONTA E PAGAR DEPOIS"
              onPress={() => setRegistered(true)}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ label, value, onChange, keyboard = "default", secure = false }) => (
  <View style={{ marginBottom: 15 }}>
    {label !== "" && <Text style={{ color: '#a4bccc', fontSize: 12, marginBottom: 5 }}>{label}</Text>}
    <TextInput
      style={{ backgroundColor: '#0c3c74', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#1a4a8a' }}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      secureTextEntry={secure}
    />
  </View>
);

const styles = StyleSheet.create({
  topBar: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  scrollContent: { padding: 25 },
  sponsorHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: PALETTE.gold },
  sectionTitle: { color: PALETTE.gold, fontSize: 13, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  pendingMessage: { color: PALETTE.gold, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 16, marginBottom: 12 }
});
