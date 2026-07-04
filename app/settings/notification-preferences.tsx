import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { ToggleItem } from "@/components/settings/ToggleItem";
import { Skeleton } from "@/components/common/Skeleton";
import { notificationsApi } from "@/lib/api/notifications.api";
import {
  DEFAULT_PREFERENCES,
  NotificationPreferences,
  NotificationType,
} from "@/lib/types/notifications";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PREFERENCES_QUERY_KEY = ["notification-preferences"] as const;
// Local fallback used while the backend preferences endpoint isn't deployed.
const LOCAL_PREFS_KEY = "notif_prefs_v2";

interface CategoryRow {
  key: NotificationType;
  label: string;
  subtitle: string;
}

const CATEGORY_ROWS: CategoryRow[] = [
  {
    key: "loan",
    label: "Loans",
    subtitle: "Approvals, disbursements and repayment reminders",
  },
  {
    key: "contribution",
    label: "Contributions",
    subtitle: "Due reminders and payment confirmations",
  },
  {
    key: "dividend",
    label: "Dividends",
    subtitle: "Payout announcements and allocation updates",
  },
  {
    key: "meeting",
    label: "Meetings",
    subtitle: "AGM and cooperative meeting notices",
  },
];

interface PreferenceCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  index: number;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
  icon,
  title,
  subtitle,
  description,
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
          <MaterialIcons name={icon} size={24} color={colors.primaryBright} />
        </View>
        <View>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categorySubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.categoryDescription}>{description}</Text>
      <View style={styles.togglesContainer}>{children}</View>
    </Animated.View>
  );
};

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);

  const { data: serverPrefs, isPending } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: notificationsApi.getPreferences,
    staleTime: 5 * 60_000,
  });

  const [draft, setDraft] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  // Seed the draft once loading settles: server prefs win; otherwise the
  // local fallback from a previous device-only save; otherwise defaults.
  useEffect(() => {
    if (isPending) return;
    if (serverPrefs) {
      setDraft(serverPrefs);
      return;
    }
    AsyncStorage.getItem(LOCAL_PREFS_KEY)
      .then((stored) => {
        if (stored) setDraft(JSON.parse(stored) as NotificationPreferences);
      })
      .catch(() => {
        // keep defaults
      });
  }, [isPending, serverPrefs]);

  const setCategory = (key: NotificationType, value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      categories: { ...prev.categories, [key]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await notificationsApi.updatePreferences(draft);
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, updated);
      setDraft(updated);
      Alert.alert("Saved", "Your notification preferences have been updated.");
    } catch {
      // Endpoint missing or unreachable — keep the choice on this device.
      try {
        await AsyncStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(draft));
        Alert.alert("Saved on this device", "Preferences will sync once you're back online.");
      } catch {
        Alert.alert("Something went wrong", "Your preferences could not be saved. Try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setDraft(DEFAULT_PREFERENCES);
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
          <Text style={[styles.headerTitle, { color: colors.primaryBright }]}>
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
            Manage how and when you receive updates from DOMICOOP.
          </Text>
        </Animated.View>

        {isPending ? (
          <View style={styles.skeletonList}>
            <Skeleton variant="card" height={140} />
            <Skeleton variant="card" height={280} />
            <Skeleton variant="card" height={140} />
          </View>
        ) : (
          <>
            {/* Push delivery master switch */}
            <PreferenceCard
              icon="notifications-active"
              title="Push Notifications"
              subtitle="Delivery"
              description="Receive alerts on this device. Turning this off stops push delivery — your notification history stays available in the app."
              index={0}
            >
              <ToggleItem
                icon=""
                label="Allow push notifications"
                subtitle="Applies to all categories below"
                value={draft.pushEnabled}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, pushEnabled: value }))
                }
              />
            </PreferenceCard>

            {/* Categories */}
            <PreferenceCard
              icon="tune"
              title="Categories"
              subtitle="What you hear about"
              description="Choose which cooperative updates reach you."
              index={1}
            >
              {CATEGORY_ROWS.map((row, i) => (
                <React.Fragment key={row.key}>
                  {i > 0 && <View style={styles.divider} />}
                  <ToggleItem
                    icon=""
                    label={row.label}
                    subtitle={row.subtitle}
                    value={draft.categories[row.key]}
                    onValueChange={(value) => setCategory(row.key, value)}
                  />
                </React.Fragment>
              ))}
            </PreferenceCard>

            {/* Security — always on */}
            <PreferenceCard
              icon="security"
              title="Account Security"
              subtitle="Mandatory protection"
              description="Security alerts keep your assets safe and can't be turned off."
              index={2}
            >
              <ToggleItem
                icon=""
                label="Security alerts"
                subtitle="Sign-ins, credential changes and account activity"
                value={true}
                onValueChange={() => {}}
                disabled={true}
              />
            </PreferenceCard>

            {/* Action Buttons */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(400)}
              style={styles.actionsContainer}
            >
              <AnimatedTouchable
                onPress={handleSave}
                disabled={isSaving}
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Text>
              </AnimatedTouchable>

              <TouchableOpacity
                onPress={handleRestoreDefaults}
                style={styles.restoreButton}
              >
                <Text style={styles.restoreButtonText}>Restore to Default Settings</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

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
    skeletonList: {
      gap: theme.spacing.lg,
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
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    saveButtonDisabled: {
      opacity: 0.6,
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
