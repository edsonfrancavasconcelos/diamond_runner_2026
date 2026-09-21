import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBlue: "#0c3c74",
};

function warn(title, message) {
  if (typeof window !== "undefined") {
    window.alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export default function RunnerRegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();

  const { sponsorUuid, sponsorId, sponsorName, planName, type } =
    route.params || {};

  const [loading, setLoading] = useState(false);
  const [isValidatingSponsor, setIsValidatingSponsor] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [form, setForm] = useState({
    sponsorId: sponsorId || "",
    sponsorName: sponsorName || "",
    sponsorUuid: sponsorUuid || "",
    fullName: "",
    email: "",
    documentId: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function resolveSponsor(idDr) {
    const id = String(idDr || "").trim().toUpperCase();
    if (id.length < 4) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, id_dr")
      .eq("id_dr", id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  const createPendingAccount = async () => {
    if (loading) return;

    if (
      !form.fullName.trim() ||
      !form.documentId.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      warn(
        "Dados incompletos",
        "Preencha nome, CPF, e-mail, WhatsApp, senha e confirmação de senha."
      );
      return;
    }
    if (form.password.length < 6) {
      warn("Senha inválida", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      warn("Senha inválida", "As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      let uuid = form.sponsorUuid || sponsorUuid || "";
      let name = form.sponsorName || sponsorName || "";
      let dr = form.sponsorId || sponsorId || "";

      if (!uuid && dr) {
        const found = await resolveSponsor(dr);
        if (found) {
          uuid = found.id;
          name = found.full_name;
          dr = found.id_dr;
          setForm((prev) => ({
            ...prev,
            sponsorUuid: uuid,
            sponsorName: name,
            sponsorId: dr,
          }));
        }
      }

      if (!uuid) {
        warn(
          "Patrocinador inválido",
          "Informe o ID DR de quem indicou (ex: DR8602) e aguarde validar."
        );
        return;
      }

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
            sponsor_id: uuid,
            plan_name: planName || type || "",
            status: "PENDING",
            is_active: false,
          },
        },
      });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (!userId) throw new Error("Não foi possível criar a conta.");

          const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: form.fullName.trim(),
          document_id: cleanDocument,
          email: cleanEmail,
          sponsor_id: uuid,
          status: "PENDING",
          is_active: false,
          id_dr: null,
        },
        { onConflict: "id" }
      );
      if (profileError) throw profileError;

      setRegistered(true);
        } catch (error) {
      const msg = String(error?.message || "").toLowerCase();

      if (msg.includes("rate limit")) {
        warn(
          "Aguarde um pouco",
          "O Supabase bloqueou cadastro por excesso de e-mail. Espere uns minutos ou use outro e-mail."
        );
        return;
      }

      if (msg.includes("already registered") || msg.includes("user already")) {
        navigation.navigate("PackagesScreen", {
          email: form.email.trim().toLowerCase(),
          fullName: form.fullName.trim(),
          documentId: form.documentId.replace(/\D/g, ""),
          phone: form.phone.replace(/\D/g, ""),
          sponsorUuid: form.sponsorUuid,
          sponsorId: form.sponsorId,
          sponsorName: form.sponsorName,
        });
        return;
      }

      warn("Não foi possível cadastrar", error.message || "Tente novamente.");
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
        : plan.includes("builder") ||
            plan.includes("distributor") ||
            plan.includes("distribuidor")
          ? "BUILDER"
          : "AFILIADO";
    const link = paymentLinks[planKey];
    const cleanEmail = form.email.trim().toLowerCase();
    const separator = link.includes("?") ? "&" : "?";
    const url = `${link}${separator}prefilled_email=${encodeURIComponent(
      cleanEmail
    )}`;
    if (typeof window !== "undefined" && window.open) {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    const searchSponsor = async () => {
      const id = form.sponsorId.trim().toUpperCase();
      if (id.length < 4) return;
      if (form.sponsorUuid && id === String(sponsorId || "").toUpperCase()) {
        return;
      }

      setIsValidatingSponsor(true);
      const found = await resolveSponsor(id);
      if (found) {
        setForm((prev) => ({
          ...prev,
          sponsorName: String(found.full_name || "").toUpperCase(),
          sponsorUuid: found.id,
          sponsorId: found.id_dr,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          sponsorName: "NÃO ENCONTRADO ❌",
          sponsorUuid: "",
        }));
      }
      setIsValidatingSponsor(false);
    };

    const debounce = setTimeout(searchSponsor, 800);
    return () => clearTimeout(debounce);
  }, [form.sponsorId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={PALETTE.primary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>
          FINALIZAR CADASTRO
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.sponsorHeader,
            { backgroundColor: isDark ? PALETTE.darkBlue : "#e1f0f7" },
          ]}
        >
          <Ionicons name="shield-checkmark" size={32} color={PALETTE.gold} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{ color: "#a4bccc", fontSize: 10, fontWeight: "bold" }}
            >
              PATROCINADOR SELECIONADO:
            </Text>
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900" }}>
              {form.sponsorName || "INFORME O ID DR"}
            </Text>
            <Text
              style={{
                color: PALETTE.primary,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              ID: {form.sponsorId || "—"}
            </Text>
          </View>
          {isValidatingSponsor && (
            <ActivityIndicator size="small" color={PALETTE.gold} />
          )}
        </View>

        <Text style={styles.sectionTitle}>SEUS DADOS PESSOAIS</Text>
        <InputField
          label="NOME COMPLETO *"
          value={form.fullName}
          onChange={(v) => updateForm("fullName", v)}
        />
        <InputField
          label="CPF *"
          value={form.documentId}
          keyboard="numeric"
          onChange={(v) => updateForm("documentId", v)}
        />
        <InputField
          label="E-MAIL *"
          value={form.email}
          keyboard="email-address"
          onChange={(v) => updateForm("email", v)}
        />
        <InputField
          label="WHATSAPP *"
          value={form.phone}
          keyboard="phone-pad"
          onChange={(v) => updateForm("phone", v)}
        />
        <InputField
          label="SENHA *"
          value={form.password}
          secure
          onChange={(v) => updateForm("password", v)}
        />
        <InputField
          label="CONFIRMAR SENHA *"
          value={form.confirmPassword}
          secure
          onChange={(v) => updateForm("confirmPassword", v)}
        />

        <Text style={{ color: "#a4bccc", fontSize: 11, marginTop: 10 }}>
          ID DR de quem indicou:
        </Text>
        <InputField
          label=""
          value={form.sponsorId}
          onChange={(v) => updateForm("sponsorId", v.toUpperCase())}
        />

        {!registered ? (
          <Button
            title={loading ? "CRIANDO CONTA..." : "CONFIRMAR CADASTRO"}
            onPress={createPendingAccount}
            disabled={loading}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("PackagesScreen", {
                email: form.email.trim().toLowerCase(),
                fullName: form.fullName.trim(),
                documentId: form.documentId.replace(/\D/g, ""),
                phone: form.phone.replace(/\D/g, ""),
                sponsorUuid: form.sponsorUuid,
                sponsorId: form.sponsorId,
                sponsorName: form.sponsorName,
              })
            }
            style={{
              marginTop: 20,
              backgroundColor: "#0c3c74",
              borderWidth: 1,
              borderColor: "#FFD700",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: "#FFD700",
                fontWeight: "900",
                fontSize: 14,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              CONTA CRIADA COM SUCESSO
            </Text>
            <Text style={{ color: "#fff", fontSize: 13, lineHeight: 20 }}>
              Sua conta está inativa. Ative pagando um dos planos. Toque aqui
              para escolher o plano.
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.pendingMessage}>
          A conta nasce PENDENTE e sem ID DR. Pague agora ou pague depois.
        </Text>

     {registered && (
  <Button
    title="PAGAR DEPOIS / IR PARA LOGIN"
    onPress={() =>
      navigation.navigate("LoginDiamond", {
        email: form.email.trim().toLowerCase(),
        pending: true,
        fullName: form.fullName.trim(),
        status: "PENDING",
        is_active: false,
      })
    }
  />
)}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({
  label,
  value,
  onChange,
  keyboard = "default",
  secure = false,
}) => (
  <View style={{ marginBottom: 15 }}>
    {label !== "" && (
      <Text style={{ color: "#a4bccc", fontSize: 12, marginBottom: 5 }}>
        {label}
      </Text>
    )}
    <TextInput
      style={{
        backgroundColor: "#0c3c74",
        color: "#fff",
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#1a4a8a",
      }}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      secureTextEntry={secure}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  topTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15 },
  scrollContent: { padding: 25, paddingBottom: 40 },
  sponsorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: PALETTE.gold,
  },
  sectionTitle: {
    color: PALETTE.gold,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  pendingMessage: {
    color: PALETTE.gold,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
});