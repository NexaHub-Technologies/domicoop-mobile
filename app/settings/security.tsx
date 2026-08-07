import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ListItem } from "@/components/common/ListItem";

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

  const handleChangePassword = () => {
    router.push("/settings/change-password");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Security" onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>Security Settings</Text>
          <Text style={styles.subtitle}>
            Manage your account security and authentication methods.
          </Text>
        </Animated.View>

        {/* Security Status Card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={[styles.statusCard, elevations.raised]}
        >
          <View style={styles.statusContent}>
            <View>
              <Text style={styles.statusLabel}>Security Status</Text>
              <Text style={styles.statusTitle}>Highly Protected</Text>
              <Text style={styles.statusSubtitle}>Last checked: Today at 09:42 AM</Text>
            </View>
            <View style={styles.statusIconContainer}>
              <MaterialIcons name="verified-user" size={32} color={colors.onPrimary} />
            </View>
          </View>
          <View style={styles.watermarkContainer}>
            <MaterialIcons
              name="shield"
              size={120}
              color={`${colors.onPrimary}1A`}
            />
          </View>
        </Animated.View>

        {/* Settings List */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.settingsList, elevations.flat]}
        >
          <ListItem
            title="Change Password"
            subtitle="Last updated 3 months ago"
            leadingIcon="lock"
            onPress={handleChangePassword}
          />
        </Animated.View>

        {/* Security Tip */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={[styles.tipContainer, elevations.flat]}
        >
          <View style={styles.tipContent}>
            <MaterialIcons
              name="lightbulb"
              size={24}
              color={colors.tertiary}
            />
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Pro Security Tip</Text>
              <Text style={styles.tipText}>
                Regularly updating your password significantly reduces the
                risk of unauthorized access.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    titleContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...typography.styles.screenTitle,
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...typography.styles.bodyText,
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    statusCard: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing["2xl"],
      marginBottom: theme.spacing.lg,
      overflow: "hidden",
      position: "relative",
    },
    statusContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 1,
    },
    statusLabel: {
      ...typography.styles.sectionLabel,
      color: `${colors.onPrimary}80`,
    },
    statusTitle: {
      ...typography.styles.cardTitle,
      color: colors.onPrimary,
      marginTop: 4,
    },
    statusSubtitle: {
      ...typography.styles.bodySmall,
      color: `${colors.onPrimary}90`,
      marginTop: 2,
    },
    statusIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${colors.onPrimary}33`,
      alignItems: "center",
      justifyContent: "center",
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -24,
      right: -24,
      zIndex: 0,
    },
    settingsList: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    tipContainer: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    tipContent: {
      flexDirection: "row",
      gap: theme.spacing.base,
    },
    tipTextContainer: {
      flex: 1,
    },
    tipTitle: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onSurface,
      marginBottom: 4,
    },
    tipText: {
      ...typography.styles.bodySmall,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
    bottomPadding: {
      height: 40,
    },
  });
