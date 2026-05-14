import Constants from "expo-constants";

export const PAYSTACK_SECRET_KEY =
  Constants.expoConfig?.extra?.paystackSecretKey ||
  process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY ||
  "";

export const PAYSTACK_BASE_URL = "https://api.paystack.co";
