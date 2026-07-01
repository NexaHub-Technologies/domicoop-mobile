import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/common/Button";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

export default function SplashScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const handleGetStarted = () => {
    router.push("/settings/guidelines?context=onboarding");
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      >
        {/* Decorative Circles */}
        <View style={styles.decorativeCircleTop} />
        <View style={styles.decorativeCircleBottom} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              <Image
                source={
                  isDarkMode
                    ? require("@/assets/images/logos/domicop_logo.png")
                    : require("@/assets/images/logos/domicop_logo_black.png")
                }
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Brand Name */}
          <Text style={styles.brandName}>DOMICOP</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            The institutional ledger for modern cooperative financial growth.
          </Text>
        </View>

        {/* Bottom Gradient Fade */}
        <LinearGradient
          colors={["transparent", colors.background]}
          style={styles.bottomFade}
        />

        {/* Footer Actions */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing["2xl"] }]}
        >
          <Button
            title="Let's Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="lg"
            fullWidth
            icon="arrow-forward"
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    background: {
      flex: 1,
    },
    decorativeCircleTop: {
      position: "absolute",
      top: -96,
      right: -96,
      width: 384,
      height: 384,
      borderRadius: 192,
      backgroundColor: `${colors.primary}0D`, // 5% opacity
    },
    decorativeCircleBottom: {
      position: "absolute",
      bottom: -96,
      left: -96,
      width: 384,
      height: 384,
      borderRadius: 192,
      backgroundColor: `${colors.primary}14`, // 8% opacity
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing["2xl"],
    },
    logoWrapper: {
      marginBottom: theme.spacing.xl,
    },
    logoContainer: {
      width: 140,
      height: 140,
      justifyContent: "center",
      alignItems: "center",
    },
    logoImage: {
      width: 140,
      height: 140,
    },
    brandName: {
      fontFamily: font("display", "extrabold"),
      fontSize: theme.typography.size["4xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.md,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    tagline: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.md,
      color: colors.secondary,
      textAlign: "center",
      maxWidth: 320,
      lineHeight: theme.typography.size.md * theme.typography.lineHeight.relaxed,
    },
    footer: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingTop: theme.spacing.lg,
    },
    bottomFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
  });
