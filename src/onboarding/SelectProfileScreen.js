// src/onboarding/SelectProfileScreen.js

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CountryContext } from "../i18n/context/CountryContext";
import * as AllTexts from "../i18n/hooks/texts"; 

const COLORS = {
  background: "#0c3c74",
  primary: "#2c94bc",
  gold: "#FFD700",
  white: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.06)",
  textSub: "#a4bccc",
  border: "rgba(255, 255, 255, 0.1)",
};

export default function SelectProfileScreen() {
  const navigation = useNavigation();
  
  // Garantia de contexto
  const countryContext = useContext(CountryContext);
  const country = countryContext?.country || 'BR';

  // Garantia de objeto de texto
  const t = AllTexts.profileTexts?.[country] || AllTexts.profileTexts?.BR || {};

  // ✅ SOLUÇÃO DO ERRO: Fallbacks para cada sub-objeto
  const localization = t.localization || { symbol: "R$", locale: "pt-BR", rateToBRL: 1 };
  const types = t.types || {};
  const pricing = t.pricing || {};

  const cur = localization.symbol || "R$";
  const locale = localization.locale || 'pt-BR'; 
  const currentRate = localization.rateToBRL || 1; 

  const formatCurrency = (val) => {
    try {
      return `${cur} ${Number(val * currentRate).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (e) {
      return `${cur} ${(val * currentRate).toFixed(2)}`;
    }
  };

  const handleNavigation = (basePriceBRL, role, type, screenName) => {
    const finalAmount = basePriceBRL * currentRate;

    navigation.navigate(screenName, {
      type: type, 
      role: role, 
      amount: finalAmount, 
      currencySymbol: cur, 
      country: country,
      sponsorId: "SYSTEM", 
    });
  };

  // Se o objeto 't' ainda estiver totalmente vazio, mostra um loading simples ou view vazia para evitar o crash
  if (Object.keys(t).length === 0) {
    return <View style={{flex: 1, backgroundColor: COLORS.background}} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>{t.welcome || "WELCOME"}</Text>
          <Text style={styles.subtitle}>{t.flow || "SELECT ACCESS"}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CLIENTE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation(39.00, types.cliente, "client_app_purchase", "RunnerRegister")}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.planName, { color: COLORS.white }]}>{types.cliente || "CLIENTE"}</Text>
            <Ionicons name="cart-outline" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.priceTag}>{formatCurrency(39)}</Text>
          <Text style={styles.bulletText}>• {types.clienteDesc || ""}</Text>
        </TouchableOpacity>

        {/* AFILIADO */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation(99.00, types.afiliado, "affiliate_yearly", "FindSponsor")}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.planName, { color: COLORS.primary }]}>{types.afiliado || "AFILIADO"}</Text>
            <Ionicons name="megaphone-outline" size={26} color={COLORS.primary} />
          </View>
          <Text style={styles.priceTag}>{formatCurrency(99)} <Text style={styles.unit}>{pricing.yearly || ""}</Text></Text>
          <Text style={styles.bulletText}>• {types.afiliadoDesc || ""}</Text>
        </TouchableOpacity>

        {/* DISTRIBUIDOR */}
        <TouchableOpacity
          style={[styles.card, { borderColor: COLORS.gold, borderWidth: 1.5 }]}
          onPress={() => handleNavigation(299.00, types.distribuidor, "distributor_pack", "FindSponsor")}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.planName, { color: COLORS.gold }]}>{types.distribuidor || "DISTRIBUIDOR"}</Text>
            <Ionicons name="diamond-outline" size={24} color={COLORS.gold} />
          </View>
          <Text style={styles.priceTag}>{pricing.starting || ""} {formatCurrency(299)}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{t.action || "CONFIRM"}</Text></View>
          <Text style={styles.supportNote}>{types.distribuidorDesc || ""}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  titleContainer: { flex: 1, alignItems: "center" },
  mainTitle: { color: COLORS.white, fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: COLORS.primary, fontSize: 9, fontWeight: "bold" },
  content: { padding: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 20, fontWeight: "900" },
  priceTag: { color: COLORS.white, fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  unit: { fontSize: 12, fontWeight: "normal", opacity: 0.6 },
  bulletText: { color: COLORS.textSub, fontSize: 13 },
  supportNote: { color: COLORS.textSub, fontSize: 11, marginTop: 12, fontStyle: "italic", textAlign: "center", lineHeight: 16 },
  badge: { backgroundColor: COLORS.gold, padding: 8, borderRadius: 8, marginTop: 10, alignItems: "center" },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "900" },
});
