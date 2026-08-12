import React, { useContext, useEffect, useRef } from "react";
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Alert
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CountryContext } from "../i18n/context/CountryContext";
import { useTheme } from "../i18n/context/ThemeContext";
import { findSponsorTexts } from "../i18n/hooks/texts";

const PALETTE = {
  primary: "#2c94bc",
  success: "#25D366",
  gold: "#FFD700",
  dark: "#0c3c74",
  glass: "rgba(255, 255, 255, 0.05)",
};

export default function FindSponsorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { country = "BR" } = useContext(CountryContext) || {};
  const { theme, toggleTheme, isDark } = useTheme();
  const texts = findSponsorTexts[country] || findSponsorTexts.BR;
  const params = route.params || {};

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const whatsappNumber = "5583986104110";
  const emailAdmin = "comercial@diamondrunner.com.br";
  const openWhatsApp = () => {
    const msg = `Olá! Preciso de um patrocinador oficial para o Diamond Runner 2026.\n\nMEUS DADOS:\n- Nome:\n- CPF:`;
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(msg)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`);
      }
    });
  };
  const openEmail = () => {
    const subject = encodeURIComponent("SOLICITAÇÃO DE PATROCINADOR - DIAMOND RUNNER");
    const body = encodeURIComponent(
      "Olá Suporte Diamond,\n\n" +
      "Solicito um patrocinador oficial para ativação de conta.\n\n" +
      "MEUS DADOS:\n" +
      "- Nome:\n" +
      "- CPF:\n" + 
      "- Cidade/UF:\n" +
      "- Telefone:"
    ).replace(/%0A/g, "%0D%0A"); 

    const url = `mailto:${emailAdmin}?subject=${subject}&body=${body}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Não encontramos um aplicativo de e-mail configurado.");
    });
  };

  const handleAlreadyHaveSponsor = () => {
    navigation.navigate("RunnerRegister", { ...params, skipSponsorSearch: true });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>SUPORTE AO ATLETA</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconCircle}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={isDark ? PALETTE.gold : PALETTE.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.iconBadge}>
            <Ionicons name="people" size={40} color={PALETTE.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{texts.introTitle || "Precisa de um Patrocinador?"}</Text>
          <Text style={[styles.subtitle, { color: theme.textSub || "#647c9c" }]}>
            {texts.introSubtitle1 || "Conecte-se com um líder oficial para receber suporte e estratégias exclusivas."}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], paddingHorizontal: 25 }}>
          <TouchableOpacity 
            style={[styles.primaryActionCard, { backgroundColor: PALETTE.primary }]}
            onPress={handleAlreadyHaveSponsor}
          >
            <View>
              <Text style={styles.actionCardTitle}>ESTOU PRONTO!</Text>
              <Text style={styles.actionCardSub}>JÁ TENHO UM PATROCINADOR</Text>
            </View>
            <Ionicons name="rocket" size={28} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.dividerContainer}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSub }]}>OU SOLICITE UM AGORA</Text>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.contactGrid}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: "#25D36620", borderColor: "#25D36640" }]} 
            onPress={openWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
            <Text style={[styles.contactLabel, { color: theme.text }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: `${PALETTE.primary}20`, borderColor: `${PALETTE.primary}40` }]}
            onPress={openEmail}
          >
            <Ionicons name="mail" size={32} color={PALETTE.primary} />
            <Text style={[styles.contactLabel, { color: theme.text }]}>E-mail</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafd" }]}>
          <Text style={[styles.infoBoxTitle, { color: PALETTE.primary }]}>DADOS NECESSÁRIOS:</Text>
          {["Nome Completo", "CPF", "Cidade/Estado", "Telefone"].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name="chevron-forward" size={14} color={PALETTE.primary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  hero: { alignItems: 'center', padding: 30 },
  iconBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${PALETTE.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  primaryActionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, elevation: 8, shadowColor: PALETTE.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  actionCardTitle: { color: '#FFF', fontSize: 12, fontWeight: 'bold', opacity: 0.9 },
  actionCardSub: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', padding: 30 },
  line: { flex: 1, height: 1, opacity: 0.5 },
  dividerText: { marginHorizontal: 15, fontSize: 10, fontWeight: 'bold' },
  contactGrid: { flexDirection: 'row', paddingHorizontal: 25, justifyContent: 'space-between' },
  contactCard: { width: '47%', height: 120, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { marginTop: 10, fontWeight: 'bold', fontSize: 14 },
  infoBox: { margin: 25, padding: 20, borderRadius: 20 },
  infoBoxTitle: { fontWeight: '900', fontSize: 12, marginBottom: 15, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 14, fontWeight: '500' }
});
