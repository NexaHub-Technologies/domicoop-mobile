import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { ToggleItem } from "@/components/settings/ToggleItem";
import { usePersistentState } from "@/hooks/usePersistentState";

interface SettingsItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  showChevron = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);

  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsItemContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingsItemLabel}>{label}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
      )}
    </TouchableOpacity>
  );
};

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);

  // Persistent state for toggles
  const [twoFAEnabled, setTwoFAEnabled] = usePersistentState("twoFAEnabled", true);
  const [biometricEnabled, setBiometricEnabled] = usePersistentState(
    "biometricEnabled",
    false,
  );

  const handleChangePassword = () => {
    router.push("/settings/change-password");
  };

  const handleLoginHistory = () => {
    Alert.alert("Coming Soon", "Login history feature is under development.");
  };

  const handleTrustedDevices = () => {
    Alert.alert("Coming Soon", "Trusted devices management is under development.");
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      "Log Out All Devices",
      "This will log you out from all devices except this one. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // Simulate logout all
            Alert.alert("Success", "You have been logged out from all other devices.");
          },
        },
      ],
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Security</Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

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
          style={styles.statusCard}
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
          style={styles.settingsList}
        >
          {/* Change Password */}
          <SettingsItem
            icon="lock"
            label="Change Password"
            subtitle="Last updated 3 months ago"
            onPress={handleChangePassword}
          />

          {/* 2FA Toggle */}
          <ToggleItem
            icon="vibration"
            label="Two-Factor Authentication (2FA)"
            subtitle="Enhanced account protection"
            value={twoFAEnabled}
            onValueChange={setTwoFAEnabled}
          />

          {/* Biometric Toggle */}
          <ToggleItem
            icon="fingerprint"
            label="Biometric Login"
            subtitle="Face ID or Fingerprint"
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />
        </Animated.View>

        {/* Activity Tracking Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>Activity Tracking</Text>
          <View style={styles.settingsList}>
            <SettingsItem
              icon="history"
              label="Login History"
              subtitle="View your recent active sessions"
              onPress={handleLoginHistory}
            />
            <SettingsItem
              icon="devices"
              label="Trusted Devices"
              subtitle="iPhone 15 Pro, MacBook Pro M3"
              onPress={handleTrustedDevices}
            />
          </View>
        </Animated.View>

        {/* Security Tip */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.tipContainer}
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
                Regularly updating your password and monitoring your login history
                significantly reduces the risk of unauthorized access.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Logout All Devices */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
          style={styles.logoutContainer}
        >
          <TouchableOpacity onPress={handleLogoutAllDevices}>
            <Text style={styles.logoutText}>Log Out of All Other Devices</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.base,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      minWidth: 44,
    },
    headerTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
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
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size["2xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontFamily: font("body", "regular"),
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
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    statusContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 1,
    },
    statusLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: `${colors.onPrimary}80`,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    statusTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onPrimary,
      marginTop: 4,
    },
    statusSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
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
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsItemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    textContainer: {
      flex: 1,
    },
    settingsItemLabel: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    settingsItemSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    sectionTitle: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.base,
    },
    tipContainer: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
    },
    tipContent: {
      flexDirection: "row",
      gap: theme.spacing.base,
    },
    tipTextContainer: {
      flex: 1,
    },
    tipTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      marginBottom: 4,
    },
    tipText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
    logoutContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
    },
    logoutText: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.error,
    },
    bottomPadding: {
      height: 40,
    },
  });
