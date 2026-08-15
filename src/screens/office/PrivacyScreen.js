import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.h1}>POLÍTICA DE PRIVACIDADE</Text>
      <Text style={styles.p}>
        Esta política descreve o tratamento de dados pessoais no Diamond Runner
        em conformidade com a Lei nº 13.709/2018 (LGPD).
      </Text>
      <Text style={styles.h2}>1. Controlador</Text>
      <Text style={styles.p}>
        EFVasconcelos Sistemas — contato: comercial@diamondrunner.com.br
      </Text>
      <Text style={styles.h2}>2. Dados coletados</Text>
      <Text style={styles.p}>
        Nome, e-mail, CPF, telefone/WhatsApp, dados de acesso, patrocinador,
        informações de plano/pagamento e registros necessários à operação da rede.
      </Text>
      <Text style={styles.h2}>3. Finalidades</Text>
      <Text style={styles.p}>
        Prestação do serviço, autenticação, suporte, cumprimento de obrigações
        legais, prevenção a fraudes e comunicação operacional.
      </Text>
      <Text style={styles.h2}>4. Bases legais</Text>
      <Text style={styles.p}>
        Execução de contrato, legítimo interesse (quando aplicável) e
        cumprimento de obrigação legal/regulatória.
      </Text>
      <Text style={styles.h2}>5. Compartilhamento</Text>
      <Text style={styles.p}>
        Processadores de pagamento, infraestrutura (ex.: Supabase) e autoridades
        quando exigido por lei. Não vendemos seus dados.
      </Text>
      <Text style={styles.h2}>6. Direitos do titular</Text>
      <Text style={styles.p}>
        Confirmação, acesso, correção, anonimização, portabilidade, eliminação
        (quando cabível) e informação sobre compartilhamentos — via suporte.
      </Text>
      <Text style={styles.h2}>7. Segurança e retenção</Text>
      <Text style={styles.p}>
        Medidas técnicas e administrativas razoáveis. Dados mantidos pelo tempo
        necessário às finalidades e obrigações legais.
      </Text>
      <Text style={styles.foot}>Última atualização: agosto/2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061d36" },
  h1: { color: "#FFD700", fontWeight: "900", fontSize: 16, marginBottom: 16 },
  h2: { color: "#2c94bc", fontWeight: "bold", marginTop: 16, marginBottom: 6 },
  p: { color: "#a4bccc", lineHeight: 20, fontSize: 13 },
  foot: { color: "#647c9c", marginTop: 24, fontSize: 11 },
});