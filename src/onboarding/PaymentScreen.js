// Local: src/onboarding/PaymentScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useState, useMemo } from "react";
import { ActivityIndicator, Alert, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { createCheckoutSession } from "../services/checkoutService";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50"
};

export default function PaymentScreen() {
  const route = useRoute();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const params = route.params || {};
  const { type, planName, email, amount } = params;

  const planInfo = useMemo(() => {
    const t = `${planName || type || ""}`.toLowerCase();
    const price = t.includes("elite") ? 1599.0 : t.includes("prime") ? 799.0 : t.includes("builder") || t.includes("distributor") || t.includes("distribuidor") ? 299.0 : t.includes("affiliate") || t.includes("afiliado") ? 99.0 : Number(amount) || 99.0;
    const name = t.includes("elite") ? "ELITE" : t.includes("prime") ? "PRIME" : t.includes("builder") || t.includes("distributor") || t.includes("distribuidor") ? "BUILDER" : t.includes("affiliate") || t.includes("afiliado") ? "AFILIADO" : "DISTRIBUIDOR";
    return { name, price, voucherCredit: Number((price * 0.3 + 10).toFixed(2)) };
  }, [type, planName, amount]);

  const paymentLinks = {
    AFILIADO: "https://buy.stripe.com/aFa6oHaxL6bN5td5jaa3u08",
    DISTRIBUIDOR: "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    BUILDER: "https://buy.stripe.com/9B63cvdJX7fRbRB4f6a3u09",
    PRIME: "https://buy.stripe.com/8x24gzcFTas34p98vma3u0a",
    ELITE: "https://buy.stripe.com/aFafZh35j57JaNxbHya3u0b",
  };

  function openStripe() {
    const link = paymentLinks[planInfo.name];
    const cleanEmail = email?.trim().toLowerCase() || "";
    if (!link) {
      Alert.alert("Pagamento indisponível", "Link Stripe deste plano não configurado.");
      return;
    }
    const sep = link.includes("?") ? "&" : "?";
    const url = `${link}${sep}prefilled_email=${encodeURIComponent(cleanEmail)}`;
    if (typeof window !== "undefined" && window.open) {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  }

  // Fluxo novo (opcional): Stripe Checkout Session dinâmica via Supabase Edge Function.
  async function handleSecureCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const url = await createCheckoutSession(planInfo.name);
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Pagamento indisponível", error.message || "Não foi possível iniciar o checkout seguro.");
    } finally {
      setCheckoutLoading(false);
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
        <TouchableOpacity style={styles.payButton} onPress={openStripe}>
          <Text style={styles.btnText}>PAGAR COM STRIPE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, styles.secureCheckoutButton]}
          onPress={handleSecureCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>PAGAR (CHECKOUT SEGURO)</Text>}
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
  secureCheckoutButton: { backgroundColor: PALETTE.dark, borderWidth: 1, borderColor: PALETTE.primary, marginTop: 15 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sandboxDivider: { marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20, width: '100%' },
  sandboxLabel: { color: PALETTE.gold, fontSize: 10, textAlign: 'center', marginBottom: 15, letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', width: '85%' },
  modalTitle: { fontWeight: 'bold', marginBottom: 20, fontSize: 18 },
  qrImg: { width: 200, height: 200, marginBottom: 20 },
  copyBtn: { backgroundColor: PALETTE.dark, padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }
});
