import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

function SettingsLayoutContent() {
  const { colors, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="theme-preference" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="notification-preferences" />
        <Stack.Screen name="security" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="guidelines" />
        <Stack.Screen name="privacy-policy" />
      </Stack>
    </>
  );
}

export default function SettingsLayout() {
  return (
    <SafeAreaProvider>
      <SettingsLayoutContent />
    </SafeAreaProvider>
  );
}
