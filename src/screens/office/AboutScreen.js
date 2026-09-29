import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const COLORS = { bg: "#0c3c74", gold: "#FFD700", white: "#FFFFFF", muted: "#d7e3eb", primary: "#2c94bc" };

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>SOBRE / EMPRESA</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOBRE O APP</Text>
        <Text style={styles.label}>Nome</Text><Text style={styles.value}>Diamond Runner</Text>
        <Text style={styles.label}>Desenvolvido por</Text><Text style={styles.value}>EFVasconcelos Sistemas</Text>
        <Text style={styles.label}>Versão</Text><Text style={styles.value}>1.0.0</Text>
        <Text style={styles.paragraph}>O Diamond Runner é uma plataforma de aplicativos de alta performance para o dia a dia, com escritório digital, rede de indicação, sistema de vendas e pontuação.</Text>
        <Text style={styles.paragraph}>O app é uma ferramenta de operação e acompanhamento. O resultado depende de atividade real.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOBRE A EMPRESA</Text>
        <Text style={styles.label}>Nome fantasia</Text><Text style={styles.value}>Diamond Runner</Text>
        <Text style={styles.label}>Desenvolvimento / tecnologia</Text><Text style={styles.value}>EFVasconcelos Sistemas</Text>
        <Text style={styles.label}>Modelo</Text><Text style={styles.value}>Marketing multinível (MMN) focado em aplicativos úteis no cotidiano, com sistema de vendas e pontuação.</Text>
        <Text style={styles.heading}>Missão</Text><Text style={styles.paragraph}>Levar aplicativos de alta performance para o dia a dia e oferecer um modelo transparente de vendas e pontuação, em que a remuneração esteja ligada a produtos e serviços reais.</Text>
        <Text style={styles.heading}>Visão</Text><Text style={styles.paragraph}>Ser referência em MMN de tecnologia no Brasil, com rede sustentável, escritório digital claro e aplicativos que as pessoas realmente usam.</Text>
        <Text style={styles.heading}>Valores</Text>
        <Text style={styles.paragraph}>• Transparência{`\n`}• Produto real antes de rede{`\n`}• Ética comercial{`\n`}• Pontuação ligada a venda e uso{`\n`}• Respeito à LGPD{`\n`}• Sem promessa de resultado financeiro</Text>
        <Text style={styles.heading}>Compromisso com o modelo</Text>
        <Text style={styles.paragraph}>A Diamond Runner não é pirâmide. Não se paga para “entrar na rede” como único produto. A base do negócio são aplicativos e ferramentas de uso diário. Indicação e pontuação existem para reconhecer vendas e uso reais. Quem apenas recruta, sem atividade ligada aos aplicativos, não tem garantia de ganho.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 22, paddingBottom: 42 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 24 },
  section: { borderTopWidth: 2, borderTopColor: COLORS.primary, paddingTop: 18, marginBottom: 28 },
  sectionTitle: { color: COLORS.gold, fontSize: 18, fontWeight: "900", letterSpacing: 1, marginBottom: 18 },
  label: { color: COLORS.muted, fontSize: 12, marginTop: 10 },
  value: { color: COLORS.white, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  heading: { color: COLORS.gold, fontSize: 16, fontWeight: "800", marginTop: 20, marginBottom: 8 },
  paragraph: { color: COLORS.muted, fontSize: 15, lineHeight: 24, marginTop: 12 },
});
