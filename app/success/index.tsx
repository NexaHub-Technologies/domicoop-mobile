import React from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { Button } from "@/components/common/Button";
import { Money } from "@/components/common/Money";

export default function SuccessScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{
    title?: string;
    message?: string;
    amount?: string;
  }>();

  const amount = params.amount ? Number(params.amount) : null;

  const handleDone = () => {
    router.dismissAll();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.delay(100).duration(400)}>
          <LinearGradient
            colors={colors.brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <MaterialIcons name="check" size={44} color={colors.onPrimary} />
          </LinearGradient>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(250).duration(400)} style={styles.title}>
          {params.title || "All done"}
        </Animated.Text>

        {amount !== null && !Number.isNaN(amount) && (
          <Animated.View entering={FadeInUp.delay(320).duration(400)}>
            <Money amount={amount} size="xl" style={styles.amount} />
          </Animated.View>
        )}

        <Animated.Text entering={FadeInUp.delay(400).duration(400)} style={styles.message}>
          {params.message || "Your transaction was completed successfully."}
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.footer}>
        <Button title="Back to Home" onPress={handleDone} variant="primary" size="lg" fullWidth />
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing["2xl"],
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: theme.borderRadius.full,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing["2xl"],
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    title: {
      ...typography.styles.screenTitle,
      color: colors.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.base,
    },
    amount: {
      marginBottom: theme.spacing.base,
    },
    message: {
      ...typography.styles.bodyText,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 280,
    },
    footer: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingBottom: theme.spacing["2xl"],
    },
  });
