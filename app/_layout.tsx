import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaystackProvider } from "react-native-paystack-webview";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";

// IMPORTANT: Use your Paystack PUBLIC key (pk_test_... or pk_live_...)
// NEVER use secret keys (sk_...) in client-side code
const PAYSTACK_PUBLIC_KEY =
  (process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY as string) || "";

function RootLayoutContent() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="settings" />
        <Stack.Screen name="guidelines" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="support" />
        <Stack.Screen name="success" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PaystackProvider
          publicKey={PAYSTACK_PUBLIC_KEY}
          currency="NGN"
          defaultChannels={["card", "bank", "ussd", "qr"]}
        >
          <RootLayoutContent />
        </PaystackProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
