import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const COLORS = { bg: "#0c3c74", gold: "#FFD700", white: "#FFFFFF", muted: "#d7e3eb" };

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>TERMOS DE USO</Text>
      <Text style={styles.paragraph}>O app e o ecossistema Diamond Runner são operados por EFVasconcelos Sistemas.</Text>
      <Text style={styles.heading}>Cadastro e conta</Text>
      <Text style={styles.paragraph}>O cadastro exige dados verdadeiros, completos e atualizados. A conta só fica ATIVA após o pagamento ser confirmado. Antes disso, o status é PENDENTE e não há ID DR.</Text>
      <Text style={styles.paragraph}>O usuário é responsável pela sua senha, pela guarda de seus dados de acesso e pelo uso da conta.</Text>
      <Text style={styles.heading}>Uso da plataforma</Text>
      <Text style={styles.paragraph}>O app oferece ferramentas de escritório, rede, pontuação, vendas de aplicativos e conteúdos de apoio.</Text>
      <Text style={styles.paragraph}>Ganhos, bônus ou pontuação dependem de vendas reais, uso dos aplicativos e regras do plano vigente.</Text>
      <Text style={styles.paragraph}>Não há promessa de renda, lucro, resultado financeiro ou enriquecimento. A Diamond Runner não é investimento, aplicação financeira, sorteio ou esquema de pirâmide.</Text>
      <Text style={styles.paragraph}>Recrutamento sem venda ou atividade real não gera direito a remuneração.</Text>
      <Text style={styles.heading}>Regras e segurança</Text>
      <Text style={styles.paragraph}>A empresa pode atualizar planos, pontuação e regras, avisando no app. Uso indevido, fraude, spam ou deturpação do modelo pode gerar bloqueio da conta.</Text>
      <Text style={styles.paragraph}>Este documento segue o foro do Brasil, com respeito ao Código de Defesa do Consumidor e à Lei Geral de Proteção de Dados.</Text>
      <View style={styles.footer}><Text style={styles.footerText}>EFVasconcelos Sistemas — Diamond Runner. Documento informativo. Não substitui contrato específico.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 22, paddingBottom: 42 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 24 },
  heading: { color: COLORS.gold, fontSize: 16, fontWeight: "800", marginTop: 18, marginBottom: 8 },
  paragraph: { color: COLORS.muted, fontSize: 15, lineHeight: 24, marginBottom: 12 },
  footer: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", marginTop: 24, paddingTop: 18 },
  footerText: { color: COLORS.white, fontSize: 13, lineHeight: 20, fontStyle: "italic" },
});
