import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useMemo } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import axios from "axios";
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50",
};

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);

  const params = route.params || {};
  const { type, fullName, email, documentId, whatsapp, sponsorUuid, amount } = params;

  const planInfo = useMemo(() => {
    const t = type?.toLowerCase() || "";
    if (t.includes("elite")) return { name: "ELITE", price: 1599.0, vouchers: 30 };
    if (t.includes("prime")) return { name: "PRIME", price: 799.0, vouchers: 15 };
    if (t.includes("builder")) return { name: "BUILDER", price: 299.0, vouchers: 7 };
    return { name: "DISTRIBUIDOR", price: amount || 99.0, vouchers: 0 };
  }, [type, amount]);

  async function handleForcedActivation() {
    if (loading) return;
    setLoading(true);

    try {
      const cleanEmail = email?.trim().toLowerCase();
      const cleanCPF = documentId?.replace(/\D/g, "");

      // 1. TENTA O SIGNUP (AUTH) - Cria a conta no banco
      const tempPassword = "DR" + Math.random().toString(36).slice(-8) + "!";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            whatsapp: whatsapp,
            document_id: cleanCPF,
            sponsor_id: sponsorUuid,
            profile_type: planInfo.name.toLowerCase(),
            status: "active",
          },
        },
      });

      if (authError && !authError.message.includes("already registered")) {
        throw authError;
      }

      await supabase
        .from("profiles")
        .update({ status: "active", payment_status: "CONFIRMED" })
        .eq("email", cleanEmail);

      Alert.alert("PAGAMENTO CONFIRMADO", "Sua conta foi ativada! Vamos configurar sua senha de acesso agora.", [
        {
          text: "DEFINIR MINHA SENHA",
          onPress: () => navigation.replace("FirstAccess", { email: cleanEmail, isNewUser: true }),
        },
      ]);
    } catch (error) {
      console.error("Erro no Fluxo de Ativação:", error);
      Alert.alert("FALHA NA ATIVAÇÃO", error.message || "Erro interno");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Ionicons name="diamond" size={60} color={PALETTE.gold} />
        <Text style={styles.title}>FINALIZAR ATIVAÇÃO</Text>
        <Text style={styles.planName}>{planInfo.name}</Text>
        <Text style={styles.priceText}>R$ {planInfo.price.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.payButton, { marginBottom: 12 }]} onPress={() => navigation.navigate("StripeCheckout")}>
          <Text style={styles.btnText}>PAGAR COM CARTÃO (Stripe)</Text>
        </TouchableOpacity>

        <View style={styles.sandboxDivider}>
          <Text style={styles.sandboxLabel}>AMBIENTE DE TESTE</Text>
          <TouchableOpacity style={[styles.payButton, { backgroundColor: PALETTE.success }]} onPress={handleForcedActivation} disabled={loading}>
            <Text style={styles.btnText}>JÁ PAGUEI / ATIVAR MANUAL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: PALETTE.dark, padding: 30, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 10 },
  planName: { color: PALETTE.primary, fontSize: 16, fontWeight: "bold" },
  priceText: { color: PALETTE.gold, fontSize: 40, fontWeight: "900", marginTop: 10 },
  payButton: { backgroundColor: PALETTE.primary, padding: 20, borderRadius: 15, alignItems: "center", width: "100%" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  sandboxDivider: { marginTop: 40, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 20, width: "100%" },
  sandboxLabel: { color: PALETTE.gold, fontSize: 10, textAlign: "center", marginBottom: 15, letterSpacing: 2 },
});
