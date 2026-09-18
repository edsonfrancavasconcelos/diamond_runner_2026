// EXAMPLE: Stripe native integration (illustrative only)
// Before using this file, install '@stripe/stripe-react-native' and run EAS prebuild if using Expo managed.

/*
import React, { useEffect } from 'react';
import { Button, View } from 'react-native';
import { initStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import axios from 'axios';

export default function StripeCheckoutExample() {
  const { confirmPayment } = useConfirmPayment();

  useEffect(() => {
    initStripe({ publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY });
  }, []);

  async function handlePay() {
    // Request PaymentIntent client secret from backend
    const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/payments/create`, { amount: 1000 });
    const clientSecret = res.data.clientSecret;

    const { error } = await confirmPayment(clientSecret, { type: 'Card' });
    if (error) {
      console.warn('Payment failed', error);
    } else {
      console.log('Payment success');
    }
  }

  return (
    <View>
      <Button title="Pagar R$10" onPress={handlePay} />
    </View>
  );
}
*/

// This file is a commented example to avoid runtime errors if the native package is not installed.
