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
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { ToggleItem } from "@/components/settings/ToggleItem";
import { usePersistentState } from "@/hooks/usePersistentState";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface NotificationCategoryProps {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  index: number;
}

const NotificationCategory: React.FC<NotificationCategoryProps> = ({
  icon,
  title,
  subtitle,
  children,
  index,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Animated.View
      entering={FadeInUp.delay(200 + index * 100).duration(400)}
      style={styles.categoryContainer}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categorySubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.categoryDescription}>{getCategoryDescription(title)}</Text>
      <View style={styles.togglesContainer}>{children}</View>
    </Animated.View>
  );
};

const getCategoryDescription = (title: string): string => {
  switch (title) {
    case "Transaction Alerts":
      return "Stay updated on every movement in your account. Essential for tracking your spending and deposits.";
    case "Promotional Offers":
      return "Exclusive deals and new product features tailored to your financial goals.";
    case "Account Security":
      return "Keep your assets safe with instant alerts on sensitive account changes.";
    case "Community Updates":
      return "Engage with other investors and stay informed on global market sentiment.";
    default:
      return "";
  }
};

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);

  // Transaction Alerts
  const [largePurchases, setLargePurchases] = usePersistentState(
    "notif_largePurchases",
    true,
  );
  const [dailySummary, setDailySummary] = usePersistentState("notif_dailySummary", false);

  // Promotional Offers
  const [cashbackRewards, setCashbackRewards] = usePersistentState(
    "notif_cashbackRewards",
    true,
  );

  // Account Security (mandatory - always on)
  const [pinChanges, setPinChanges] = usePersistentState("notif_pinChanges", true);

  // Community Updates
  const [forumMentions, setForumMentions] = usePersistentState(
    "notif_forumMentions",
    false,
  );

  const handleSave = () => {
    Alert.alert("Success", "Notification preferences saved successfully!");
  };

  const handleRestoreDefaults = () => {
    setLargePurchases(true);
    setDailySummary(false);
    setCashbackRewards(true);
    setPinChanges(true);
    setForumMentions(false);
    Alert.alert("Restored", "Settings have been restored to defaults.");
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
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Notifications
          </Text>
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
          <Text style={styles.title}>Notification Preferences</Text>
          <Text style={styles.subtitle}>
            Manage how and when you receive updates from DOMICOP.
          </Text>
        </Animated.View>

        {/* Transaction Alerts */}
        <NotificationCategory
          icon="account-balance-wallet"
          title="Transaction Alerts"
          subtitle="Real-time Activity"
          index={0}
        >
          <ToggleItem
            icon=""
            label="Large Purchases"
            subtitle="Notify when a transaction exceeds ₦50,000"
            value={largePurchases}
            onValueChange={setLargePurchases}
          />
          <View style={styles.divider} />
          <ToggleItem
            icon=""
            label="Daily Summary"
            subtitle="A curated recap of your daily financial ledger"
            value={dailySummary}
            onValueChange={setDailySummary}
          />
        </NotificationCategory>

        {/* Promotional Offers */}
        <NotificationCategory
          icon="sell"
          title="Promotional Offers"
          subtitle="Growth & Rewards"
          index={1}
        >
          <ToggleItem
            icon=""
            label="Cashback Rewards"
            subtitle="Alerts for boosted reward categories"
            value={cashbackRewards}
            onValueChange={setCashbackRewards}
          />
        </NotificationCategory>

        {/* Account Security */}
        <NotificationCategory
          icon="security"
          title="Account Security"
          subtitle="Mandatory Protection"
          index={2}
        >
          <ToggleItem
            icon=""
            label="New Device Login"
            subtitle="Required for your account security"
            value={true}
            onValueChange={() => {}}
            disabled={true}
          />
          <View style={styles.divider} />
          <ToggleItem
            icon=""
            label="Pin & Password Changes"
            subtitle="Notify immediately when credentials change"
            value={pinChanges}
            onValueChange={setPinChanges}
          />
        </NotificationCategory>

        {/* Community Updates */}
        <NotificationCategory
          icon="forum"
          title="Community Updates"
          subtitle="Social & Network"
          index={3}
        >
          <ToggleItem
            icon=""
            label="Forum Mentions"
            subtitle="Alert when someone replies to your thread"
            value={forumMentions}
            onValueChange={setForumMentions}
          />
        </NotificationCategory>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
          style={styles.actionsContainer}
        >
          <AnimatedTouchable
            onPress={handleSave}
            style={styles.saveButton}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </AnimatedTouchable>

          <TouchableOpacity onPress={handleRestoreDefaults} style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>Restore to Default Settings</Text>
          </TouchableOpacity>
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
    categoryContainer: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      marginBottom: theme.spacing.base,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    categorySubtitle: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    categoryDescription: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
    togglesContainer: {
      gap: theme.spacing.base,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: theme.spacing.sm,
    },
    actionsContainer: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    restoreButton: {
      paddingVertical: theme.spacing.base,
      alignItems: "center",
    },
    restoreButtonText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    bottomPadding: {
      height: 40,
    },
  });
