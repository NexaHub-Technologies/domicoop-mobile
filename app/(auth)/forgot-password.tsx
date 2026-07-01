import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { HeroSection } from "@/components/auth/HeroSection";
import { BackButton } from "@/components/auth/BackButton";
import { SecurityBadge } from "@/components/auth/SecurityBadge";
import { FormCard } from "@/components/auth/FormCard";
import { KeyboardAwareWrapper } from "@/components/auth/KeyboardAwareWrapper";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [email, setEmail] = useState("");

  const handleSendResetLink = () => {
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleJoinArchive = () => {
    router.push("/sign-up");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.backButtonContainer, { top: insets.top + theme.spacing.lg }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <SecurityBadge
        style={[styles.securityBadge, { top: insets.top + theme.spacing.lg }]}
      />

      <KeyboardAwareWrapper style={styles.wrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection
            title="Forgot Password?"
            subtitle="Enter your email and we'll send you a reset link"
            showLogo={false}
            height={260}
            imageSource={require("../../assets/images/auth/hero-password.jpg")}
          />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="lock" size={40} color={colors.primary} />
            </View>
          </View>

          <View style={styles.content}>
            <FormCard overlap>
              <Input
                label="Email Address"
                placeholder="name@institution.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Button
                title="Send Reset Link"
                onPress={handleSendResetLink}
                variant="primary"
                size="lg"
                fullWidth
                icon="arrow-forward"
              />

              <TouchableOpacity onPress={handleSignIn} style={styles.signInLink}>
                <Text style={styles.signInText}>
                  Remember your password?{" "}
                  <Text style={styles.signInLinkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </FormCard>

            <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
              <View style={styles.footerDivider} />
              <TouchableOpacity onPress={handleJoinArchive}>
                <Text style={styles.footerLink}>Join Archive</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareWrapper>
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
    iconContainer: {
      alignItems: "center",
      marginTop: -40,
      marginBottom: theme.spacing.lg,
      zIndex: 10,
    },
    iconWrapper: {
      backgroundColor: colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.xl,
    },
    signInLink: {
      alignItems: "center",
      marginTop: theme.spacing.sm,
    },
    signInText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    signInLinkText: {
      color: colors.primary,
      fontFamily: font("body", "bold"),
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
    footerLink: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.base,
      color: colors.primary,
    },
  });
