import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.h1}>TERMOS DE USO</Text>
      <Text style={styles.p}>
        O aplicativo Diamond Runner é operado por EFVasconcelos Sistemas.
        Ao utilizar o app, você concorda com estes termos.
      </Text>
      <Text style={styles.h2}>1. Objeto</Text>
      <Text style={styles.p}>
        O app disponibiliza acesso a produtos digitais, área de membro,
        rede de indicações e informações comerciais. Não há promessa de
        renda fixa ou resultado financeiro garantido.
      </Text>
      <Text style={styles.h2}>2. Cadastro</Text>
      <Text style={styles.p}>
        Você é responsável pela veracidade dos dados (nome, CPF, e-mail,
        telefone) e pela guarda de suas credenciais de acesso.
      </Text>
      <Text style={styles.h2}>3. Pagamentos e planos</Text>
      <Text style={styles.p}>
        Valores de adesão e upgrades seguem os pacotes vigentes no app.
        Comissões e bônus dependem de regras do plano de marketing e de
        atividade válida, sem garantia de ganhos.
      </Text>
      <Text style={styles.h2}>4. Conduta</Text>
      <Text style={styles.p}>
        É proibido uso fraudulento, spam, dados falsos ou qualquer prática
        que viole a legislação brasileira ou prejudique a plataforma.
      </Text>
      <Text style={styles.h2}>5. Propriedade intelectual</Text>
      <Text style={styles.p}>
        Marca, layout, textos e software pertencem a EFVasconcelos Sistemas
        ou licenciantes. Uso não autorizado é vedado.
      </Text>
      <Text style={styles.h2}>6. Foro</Text>
      <Text style={styles.p}>
        Aplica-se a legislação brasileira. Fica eleito o foro da comarca
        do domicílio do usuário, nos termos do CDC, quando aplicável.
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