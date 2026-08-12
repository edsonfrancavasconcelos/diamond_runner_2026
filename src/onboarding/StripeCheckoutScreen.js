import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { CardField, initStripe, useConfirmPayment } from '@stripe/stripe-react-native';

export default function StripeCheckoutScreen() {
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not set in EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return;
    }
    initStripe({ publishableKey: key });
  }, []);

  async function handlePay() {
    try {
      setLoading(true);
      // criar PaymentIntent no backend (amount em centavos)
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/payments/create`, {
        amount: 1000,
        currency: 'brl',
        receipt_email: null,
      });

      const clientSecret = res.data.clientSecret;
      if (!clientSecret) throw new Error('clientSecret not returned');

      const { error } = await confirmPayment(clientSecret, {
        type: 'Card',
      });

      if (error) {
        Alert.alert('Erro no pagamento', error.message);
      } else {
        Alert.alert('Pagamento', 'Pagamento confirmado com sucesso');
      }
    } catch (err) {
      console.error('Payment error', err.message || err);
      Alert.alert('Erro', err.message || 'Erro no processamento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
        style={{ height: 50, marginVertical: 30 }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Pagar R$10" onPress={handlePay} />
      )}
    </View>
  );
}
