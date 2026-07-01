import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/common/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { SecurityBadge } from "@/components/auth/SecurityBadge";
import { HeroSection } from "@/components/auth/HeroSection";
import { useTheme } from "@/contexts/ThemeContext";
import { signUp } from "@/lib/api/sign-up.api";
import { signInWithGoogle } from "@/lib/google-signin";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleCreateAccount = () => {
    router.push("/sign-up");
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleGoogleSignIn = async () => {
    setError(undefined);
    setIsGoogleLoading(true);

    try {
      const idToken = await signInWithGoogle();
      await signUp.googleLogin(idToken);
      router.replace("/(tabs)");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Security Badge - positioned with top inset */}
      <SecurityBadge
        style={[styles.securityBadge, { top: insets.top + theme.spacing.lg }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <HeroSection
          title="Let's Get Started!"
          subtitle="The institutional ledger for your cooperative digital archive and assets."
          height={620}
          imageSource={require("@/assets/images/auth/hero-welcome.jpg")}
        />

        {/* Main Content */}
        <View style={[styles.content, { paddingBottom: insets.bottom }]}>
          {/* Primary Actions */}
          <View style={styles.actions}>
            <Button
              title="Create Account"
              onPress={handleCreateAccount}
              variant="primary"
              size="lg"
              fullWidth
              icon="arrow.right"
            />
            <Button
              title="Sign In"
              onPress={handleSignIn}
              variant="outlined"
              size="lg"
              fullWidth
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <GoogleSignInButton
            onPress={handleGoogleSignIn}
            loading={isGoogleLoading}
            disabled={isGoogleLoading}
          />

          {/* Error Message */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Terms & Privacy */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => {}}>
                Terms of Service
              </Text>
              {" & "}
              <Text style={styles.termsLink} onPress={() => {}}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    securityBadge: {
      position: "absolute",
      right: theme.spacing.lg,
      zIndex: 10,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingTop: -32,
      paddingBottom: theme.spacing["3xl"],
      maxWidth: 400,
      alignSelf: "center",
      width: "100%",
    },
    actions: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    terms: {
      paddingHorizontal: theme.spacing.base,
    },
    termsText: {
      fontFamily: theme.typography.fontFamily.label,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.wider,
      lineHeight: theme.typography.size.xs * 1.6,
    },
    termsLink: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outlineVariant,
    },
    dividerText: {
      fontFamily: theme.typography.fontFamily.label,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.wider,
      marginHorizontal: theme.spacing.base,
    },
    errorText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.size.sm,
      color: colors.error,
      textAlign: "center",
      marginTop: theme.spacing.base,
    },
  });
