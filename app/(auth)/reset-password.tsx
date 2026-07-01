import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { HeroSection } from "@/components/auth/HeroSection";
import { BackButton } from "@/components/auth/BackButton";
import { SecurityBadge } from "@/components/auth/SecurityBadge";
import { FormCard } from "@/components/auth/FormCard";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { KeyboardAwareWrapper } from "@/components/auth/KeyboardAwareWrapper";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

  const handleUpdatePassword = () => {
  };

  const handleSignIn = () => {
    router.push("/sign-in");
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
            title="Reset Password"
            subtitle="Create a new secure password for your account"
            showLogo={false}
            height={260}
            imageSource={require("../../assets/images/auth/hero-password.jpg")}
          />

          <View style={styles.content}>
            <FormCard overlap>
              <View>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <PasswordStrength password={newPassword} />
                <Text style={styles.requirementsText}>
                  Use 8+ characters with a mix of letters, numbers & symbols.
                </Text>
              </View>

              <Input
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={
                  confirmPassword && !passwordsMatch
                    ? "Passwords do not match"
                    : undefined
                }
              />

              <Button
                title="Update Password"
                onPress={handleUpdatePassword}
                variant="primary"
                size="lg"
                fullWidth
                icon="arrow-forward"
                disabled={!passwordsMatch || newPassword.length < 8}
              />

              <TouchableOpacity onPress={handleSignIn} style={styles.signInLink}>
                <Text style={styles.signInText}>
                  Remembered your password?{" "}
                  <Text style={styles.signInLinkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </FormCard>
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
    strengthContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.base,
    },
    requirementsText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.base,
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
  });
