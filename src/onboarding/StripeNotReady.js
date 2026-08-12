import React from 'react';
import { View, Text, Button, Linking, StyleSheet } from 'react-native';

export default function StripeNotReady({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento por Cartão</Text>
      <Text style={styles.text}>
        O pagamento por cartão (integração nativa Stripe) requer um build nativo. Para testar
        este recurso você deve gerar uma build com EAS ou usar um ambiente que suporte módulos nativos.
      </Text>
      <Text style={styles.text}>Opções:</Text>
      <Button title="Instruções para EAS Build" onPress={() => Linking.openURL('https://docs.expo.dev/eas/build/')} />
      <View style={{ height: 12 }} />
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  text: { marginBottom: 8, color: '#333' },
});
