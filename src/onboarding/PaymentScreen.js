// Local: src/onboarding/PaymentScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useState, useMemo } from "react";
import { ActivityIndicator, Alert, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50"
};

export default function PaymentScreen() {
  const route = useRoute();
  
  const [loading, setLoading] = useState(false);

  const params = route.params || {};
  const { type, planName, fullName, email, documentId, amount } = params;

  const planInfo = useMemo(() => {
    const t = `${planName || type || ""}`.toLowerCase();
    const price = t.includes("elite") ? 1599.0 : t.includes("prime") ? 799.0 : t.includes("builder") || t.includes("distributor") || t.includes("distribuidor") ? 299.0 : t.includes("affiliate") || t.includes("afiliado") ? 99.0 : Number(amount) || 99.0;
    const name = t.includes("elite") ? "ELITE" : t.includes("prime") ? "PRIME" : t.includes("builder") || t.includes("distributor") || t.includes("distribuidor") ? "BUILDER" : t.includes("affiliate") || t.includes("afiliado") ? "AFILIADO" : "DISTRIBUIDOR";
    return { name, price, voucherCredit: Number((price * 0.3 + 10).toFixed(2)) };
  }, [type, planName, amount]);

  const paymentLinks = {
    AFILIADO: process.env.EXPO_PUBLIC_STRIPE_LINK_AFILIADO || "https://buy.stripe.com/aFa6oHaxL6bN5td5jaa3u08",
    DISTRIBUIDOR: process.env.EXPO_PUBLIC_STRIPE_LINK_BUILDER || "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    BUILDER: process.env.EXPO_PUBLIC_STRIPE_LINK_BUILDER || "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    PRIME: process.env.EXPO_PUBLIC_STRIPE_LINK_PRIME || "https://buy.stripe.com/8x24gzcFTas34p98vma3u0a",
    ELITE: process.env.EXPO_PUBLIC_STRIPE_LINK_ELITE || "https://buy.stripe.com/aFafZh35j57JaNxbHya3u0b",
  };

  async function handleStripePayment() {
    if (loading) return;
    const link = paymentLinks[planInfo.name]?.trim();
    if (!link) {
      Alert.alert("Pagamento indisponível", "O Payment Link Stripe deste plano ainda não foi configurado.");
      return;
    }

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert("E-mail obrigatório", "Informe um e-mail válido antes de abrir o pagamento.");
      return;
    }

    setLoading(true);
    try {
      const tempPassword = `DR${Math.random().toString(36).slice(-10)}!`;
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: tempPassword,
        options: { data: { full_name: fullName, document_id: documentId?.replace(/\D/g, ''), plan_name: planInfo.name, status: 'pending' } },
      });
      if (error && !error.message.toLowerCase().includes("already registered")) throw error;

      const separator = link.includes("?") ? "&" : "?";
      await Linking.openURL(`${link}${separator}prefilled_email=${encodeURIComponent(cleanEmail)}`);
    } catch (error) {
      Alert.alert("Falha no pagamento", error.message || "Não foi possível abrir o Stripe.");
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
        <TouchableOpacity style={styles.payButton} onPress={handleStripePayment} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>PAGAR COM STRIPE</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: PALETTE.dark, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 10 },
  planName: { color: PALETTE.primary, fontSize: 16, fontWeight: 'bold' },
  priceText: { color: PALETTE.gold, fontSize: 40, fontWeight: '900', marginTop: 10 },
  payButton: { backgroundColor: PALETTE.primary, padding: 20, borderRadius: 15, alignItems: 'center', width: '100%' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sandboxDivider: { marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20, width: '100%' },
  sandboxLabel: { color: PALETTE.gold, fontSize: 10, textAlign: 'center', marginBottom: 15, letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', width: '85%' },
  modalTitle: { fontWeight: 'bold', marginBottom: 20, fontSize: 18 },
  qrImg: { width: 200, height: 200, marginBottom: 20 },
  copyBtn: { backgroundColor: PALETTE.dark, padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }
});
