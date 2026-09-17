# Stripe integration (native SDK) — guide

This project will integrate Stripe using the native SDK `@stripe/stripe-react-native` and server-side PaymentIntents. Follow these steps:

1) Install the native SDK

```bash
# In the mobile project folder
npm install @stripe/stripe-react-native
# If using Expo managed workflow, you must prebuild and use EAS Build
npx expo prebuild
eas build --platform android
```

2) Backend: provide endpoint `POST /payments/create` that returns a `clientSecret`. (Already added in `diamond-backend/src/controllers/PaymentController.ts`.)

3) Client: initialize Stripe with the publishable key and call the backend to get `clientSecret`, then confirm the payment.

Example (React Native using `@stripe/stripe-react-native`):

```js
// import {initStripe, useConfirmPayment} from '@stripe/stripe-react-native'

// initStripe({ publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY });

// const {confirmPayment} = useConfirmPayment();

// 1) Request clientSecret from backend
// const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/payments/create`, { amount: 1000 });

// 2) Confirm payment with saved card or Payment Sheet
// const { error } = await confirmPayment(data.clientSecret, { type: 'Card' /* or use PaymentSheet */ });
```

Notes:
- `STRIPE_SECRET_KEY` must stay on the backend.
- Use EAS Build for Play Store / App Store when adding native Stripe SDK.
