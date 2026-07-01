import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { HeroSection } from "@/components/auth/HeroSection";
import { BackButton } from "@/components/auth/BackButton";
import { SecurityBadge } from "@/components/auth/SecurityBadge";
import { FormCard } from "@/components/auth/FormCard";
import { KeyboardAwareWrapper } from "@/components/auth/KeyboardAwareWrapper";
import { InfoModal } from "@/components/modals/InfoModal";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/lib/api/auth.api";
import { signInWithGoogle } from "@/lib/google-signin";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

  const isEmailUnverified = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes("email") &&
      (lowerMessage.includes("not verified") ||
        lowerMessage.includes("verify") ||
        lowerMessage.includes("confirmed"))
    );
  };

  const handleSignIn = async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      await auth.login(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      if (isEmailUnverified(errorMessage)) {
        setShowUnverifiedModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleJoinArchive = () => {
    router.push("/sign-up");
  };

  const handleGoogleSignIn = async () => {
    setError(undefined);
    setIsGoogleLoading(true);

    try {
      const idToken = await signInWithGoogle();
      await auth.googleLogin(idToken);
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
      {/* Back Button - positioned with top inset */}
      <View style={[styles.backButtonContainer, { top: insets.top + theme.spacing.lg }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      {/* Security Badge - positioned with top inset */}
      <SecurityBadge
        style={[styles.securityBadge, { top: insets.top + theme.spacing.lg }]}
      />

      <KeyboardAwareWrapper style={styles.wrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <HeroSection
            title="Welcome Back! 👋"
            subtitle="Access your institutional ledger and vault"
            showLogo={false}
            height={280}
            imageSource={require("@/assets/images/auth/hero-auth.jpg")}
          />

          {/* Main Content */}
          <View style={styles.content}>
            <FormCard overlap spacing="lg">
              {/* Email Input */}
              <Input
                label="Email Address"
                placeholder="name@institution.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Input */}
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(undefined);
                }}
                secureTextEntry
                error={error}
              />

              {/* Forgot Password */}
              <View style={styles.forgotContainer}>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                onPress={handleSignIn}
                variant="primary"
                size="lg"
                fullWidth
                icon="arrow-forward"
                loading={isLoading}
                disabled={isLoading}
              />
            </FormCard>

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
              disabled={isGoogleLoading || isLoading}
            />

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
              <View style={styles.footerDivider} />
              <TouchableOpacity onPress={handleJoinArchive}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{" "}
                  <Text style={styles.footerLink}>Create an account</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareWrapper>

      {/* Unverified Email Modal */}
      <InfoModal
        visible={showUnverifiedModal}
        onClose={() => setShowUnverifiedModal(false)}
        icon="email"
        title="Email Not Verified"
        message="Please verify your email address before signing in. Check your inbox (and spam folder) for the verification link."
        primaryButtonText="Resend Verification"
        onPrimaryPress={() => {
          setShowUnverifiedModal(false);
          router.push({ pathname: "/forgot-password", params: { email } });
        }}
      />
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    wrapper: {
      flex: 1,
    },
    backButtonContainer: {
      position: "absolute",
      left: theme.spacing.lg,
      zIndex: 20,
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
    rememberForgot: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rememberMeText: {
      fontFamily: font("body", "semibold"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.wider,
    },
    forgotPassword: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.wider,
    },
    forgotContainer: {
      alignItems: "flex-end",
      marginTop: -theme.spacing.sm,
    },
    footer: {
      marginTop: theme.spacing.xl,
      alignItems: "center",
    },
    footerDivider: {
      width: "100%",
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginBottom: theme.spacing.xl,
    },
    footerText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    footerLink: {
      color: colors.primary,
      fontFamily: font("body", "bold"),
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outlineVariant,
    },
    dividerText: {
      fontFamily: font("body", "semibold"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.wider,
      marginHorizontal: theme.spacing.base,
    },
  });
