// Autor: Edson Vasconcelos | Diamond Runner 2026
// Status: HEADER SIMPLIFICADO (Sem Menu) + UPGRADES CRUZADOS

import React, { useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { CountryContext } from "../../i18n/context/CountryContext";
import { marketingTexts } from "../../i18n/hooks/texts";

const COLORS = {
  background: "rgb(10, 46, 94)", 
  primary: "#2c94bc",
  gold: "#ffb300",
  card: "rgb(1, 37, 73)",
  white: "#FFFFFF",
  upgrade: "#e67e22", 
  prime: "#1abc9c", 
};

export default function PackagesScreen() {
  const navigation = useNavigation();
  const { country } = useContext(CountryContext);
  const m = marketingTexts[country] || marketingTexts.BR;
  const cur = m.currency || "R$";

  const handlePayment = (id, price, pts, type) => {
    navigation.navigate("FindSponsor", {
      packageId: id,
      amount: price,
      points: pts,
      type: type,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER SIMPLIFICADO - FOCO NO CONTEÚDO */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.mainTitle}>DIAMOND PACKS</Text>
          <Text style={styles.subTitle}>SISTEMA DE ATIVAÇÃO E UPGRADE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* AFILIADO */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>START</Text>
          <Text style={styles.cardTitle}>AFILIADO</Text>
          <Text style={styles.cardPrice}>{cur} 99,00</Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
            onPress={() => handlePayment(0, 99, 0, "adesao")}
          >
            <Text style={styles.btnText}>ATIVAR LICENÇA</Text>
          </TouchableOpacity>
        </View>

        {/* BUILDER COM UPGRADES */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: COLORS.primary }]}>
          <Text style={styles.cardTitle}>BUILDER</Text>
          <Text style={styles.cardPrice}>{cur} 299,00</Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.primary, marginBottom: 10 }]}
            onPress={() => handlePayment(1, 299, 299, "adesao")}
          >
            <Text style={styles.btnText}>ATIVAR ADESÃO BUILDER</Text>
          </TouchableOpacity>

          <View style={styles.upgradeRow}>
            <TouchableOpacity 
              style={[styles.upBtn, { backgroundColor: COLORS.upgrade }]}
              onPress={() => handlePayment(4, 799, 500, "upgrade")}
            >
              <Text style={styles.upBtnText}>UP PRIME (799)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.upBtn, { backgroundColor: COLORS.gold }]}
              onPress={() => handlePayment(3, 1599, 1300, "upgrade")}
            >
              <Text style={[styles.upBtnText, { color: '#000' }]}>UP ELITE (1.599)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIME COM UPGRADE PARA ELITE */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: COLORS.prime }]}>
          <Text style={[styles.cardTag, { color: COLORS.prime }]}>INTERMEDIÁRIO</Text>
          <Text style={styles.cardTitle}>PRIME</Text>
          <Text style={styles.cardPrice}>{cur} 799,00</Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.prime, marginBottom: 10 }]}
            onPress={() => handlePayment(4, 799, 799, "adesao")}
          >
            <Text style={styles.btnText}>ATIVAR ADESÃO PRIME</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.gold }]}
            onPress={() => handlePayment(3, 1599, 800, "upgrade")}
          >
            <Text style={[styles.btnText, { color: '#000' }]}>UPGRADE PARA ELITE (1.599)</Text>
          </TouchableOpacity>
        </View>

        {/* ELITE */}
        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="diamond" size={30} color={COLORS.gold} style={{ alignSelf: 'center' }} />
          <Text style={[styles.cardTitle, { textAlign: 'center', marginTop: 5 }]}>ELITE</Text>
          <Text style={[styles.cardPrice, { textAlign: 'center' }]}>{cur} 1.599,00</Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.white }]}
            onPress={() => handlePayment(3, 1599, 1599, "adesao")}
          >
            <Text style={[styles.btnText, { color: COLORS.primary }]}>ATIVAR ADESÃO ELITE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
    paddingBottom: 20 
  },
  titleArea: { alignItems: 'center' },
  mainTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  subTitle: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  scroll: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 20, marginBottom: 20 },
  cardTag: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 5 },
  cardTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  cardPrice: { color: '#FFF', fontSize: 32, fontWeight: '900', marginVertical: 10 },
  upgradeRow: { flexDirection: 'row', gap: 10 },
  upBtn: { flex: 1, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  upBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  actionBtn: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', width: '100%' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
});
