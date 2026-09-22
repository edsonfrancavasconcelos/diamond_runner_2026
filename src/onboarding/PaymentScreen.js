// Local: src/onboarding/PaymentScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { createCheckoutSession } from "../services/checkoutService";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50",
};

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params || {};
  const { type, planName, email, amount } = params;
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const planInfo = useMemo(() => {
    const t = `${planName || type || ""}`.toLowerCase();
    const price = t.includes("elite")
      ? 1599.0
      : t.includes("prime")
        ? 799.0
        : t.includes("builder") ||
            t.includes("distributor") ||
            t.includes("distribuidor")
          ? 299.0
          : t.includes("affiliate") || t.includes("afiliado")
            ? 99.0
            : Number(amount) || 99.0;
    const name = t.includes("elite")
      ? "ELITE"
      : t.includes("prime")
        ? "PRIME"
        : t.includes("builder") ||
            t.includes("distributor") ||
            t.includes("distribuidor")
          ? "BUILDER"
          : t.includes("affiliate") || t.includes("afiliado")
            ? "AFILIADO"
            : "DISTRIBUIDOR";
    return { name, price };
  }, [type, planName, amount]);

  async function openStripe() {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(
        planInfo.name,
        email?.trim().toLowerCase(),
      );
      if (!url) throw new Error("Checkout Stripe indisponível.");

      setCheckoutStarted(true);
      if (typeof window !== "undefined" && window.open) {
        window.open(url, "_blank");
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      const message = error?.message || "Não foi possível iniciar o pagamento.";
      if (typeof window !== "undefined") window.alert(message);
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
        {!!email && (
          <Text style={styles.emailText}>{email}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.payButton} onPress={openStripe}>
          <Text style={styles.btnText}>{loading ? "ABRINDO STRIPE..." : "PAGAR COM STRIPE"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, styles.secondaryButton]}
          disabled={!checkoutStarted}
          onPress={() => navigation.navigate("LoginDiamond", { email })}
        >
          <Text style={styles.btnText}>JÁ PAGUEI / IR PARA LOGIN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: PALETTE.dark,
    padding: 30,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 10 },
  planName: { color: PALETTE.primary, fontSize: 16, fontWeight: "bold" },
  priceText: {
    color: PALETTE.gold,
    fontSize: 40,
    fontWeight: "900",
    marginTop: 10,
  },
  emailText: { color: "#a4bccc", marginTop: 8, fontSize: 12 },
  actions: { width: "100%", gap: 12 },
  payButton: {
    backgroundColor: PALETTE.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: PALETTE.primary,
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  successCard: {
    backgroundColor: "#0a2e5e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.gold,
    padding: 24,
    alignItems: "center",
  },
  successTitle: {
    color: PALETTE.gold,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 10,
  },
  successText: {
    color: "#d7e3eb",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
});