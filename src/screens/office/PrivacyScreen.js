import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

const COLORS = { bg: "#0c3c74", gold: "#FFD700", white: "#FFFFFF", muted: "#d7e3eb" };

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>POLÍTICA DE PRIVACIDADE (LGPD)</Text>
      <Text style={styles.heading}>Controlador</Text>
      <Text style={styles.paragraph}>O controlador é a EFVasconcelos Sistemas, no contexto do app Diamond Runner.</Text>
      <Text style={styles.heading}>Bases legais</Text>
      <Text style={styles.paragraph}>O tratamento ocorre para execução de cadastro e contrato, cumprimento de obrigações legais e legítimo interesse operacional.</Text>
      <Text style={styles.heading}>Dados tratados</Text>
      <Text style={styles.paragraph}>Podem ser tratados nome, e-mail, documento, telefone ou WhatsApp, país, perfil, ID DR, status da conta, dados de pagamento tratados por intermediários como Stripe e outros provedores, além de logs técnicos.</Text>
      <Text style={styles.heading}>Finalidades</Text>
      <Text style={styles.paragraph}>Os dados são usados para criar a conta, ativá-la após o pagamento, identificar patrocinador, operar o escritório, administrar pontuação, prestar suporte e proteger a plataforma.</Text>
      <Text style={styles.heading}>Pagamento e compartilhamento</Text>
      <Text style={styles.paragraph}>Dados de cartão não são armazenados pelo app. Eles ficam no provedor de pagamento. Compartilhamos somente o necessário com serviços de pagamento, hospedagem e autenticação Supabase. Não vendemos dados pessoais.</Text>
      <Text style={styles.heading}>Direitos do titular</Text>
      <Text style={styles.paragraph}>Nos termos da LGPD, o titular pode solicitar confirmação, acesso, correção, anonimização, portabilidade, informação e eliminação quando couber.</Text>
      <Text style={styles.paragraph}>A exclusão de conta pode ser solicitada pelo app. Dados essenciais podem ser retidos pelo prazo legal.</Text>
      <Text style={styles.heading}>Segurança</Text>
      <Text style={styles.paragraph}>Usamos acesso autenticado e controles operacionais. O perfil pendente permanece sem ID DR até a confirmação do pagamento.</Text>
      <Text style={styles.heading}>Contato</Text>
      <Text style={styles.paragraph}>Para assuntos de privacidade, use o suporte Diamond Runner no app.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 22, paddingBottom: 42 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 24 },
  heading: { color: COLORS.gold, fontSize: 16, fontWeight: "800", marginTop: 18, marginBottom: 8 },
  paragraph: { color: COLORS.muted, fontSize: 15, lineHeight: 24, marginBottom: 12 },
});
