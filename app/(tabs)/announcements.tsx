import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ListItem } from "@/components/common/ListItem";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Notification, getRelativeTime } from "@/lib/types/notifications";

interface AnnouncementRowProps {
  notification: Notification;
  index: number;
  colors: typeof lightColors;
  onPress: (notification: Notification) => void;
}

const AnnouncementRow: React.FC<AnnouncementRowProps> = ({
  notification,
  index,
  colors,
  onPress,
}) => {
  const styles = createStyles(colors);

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 50).duration(300)}
      style={styles.rowContainer}
    >
      <ListItem
        title={notification.title}
        subtitle={notification.message}
        leadingIcon="campaign"
        leadingColor={colors.primaryBright}
        chevron={false}
        onPress={() => onPress(notification)}
        trailing={
          <Text style={styles.rowTimestamp}>
            {getRelativeTime(notification.timestamp)}
          </Text>
        }
      />
    </Animated.View>
  );
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

  const {
    announcements,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    refresh,
  } = useAnnouncements();

  const hasAnnouncements = announcements.length > 0;

  const handleAnnouncementPress = (notification: Notification) => {
    router.push({
      pathname: "/notifications/announcement/[id]",
      params: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Announcements" large />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isOffline && !isLoading && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.offlineBanner}>
            <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.offlineText}>Showing cached data — offline</Text>
          </Animated.View>
        )}

        {hasAnnouncements && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
          </View>
        )}

        <View style={[styles.listCard, elevations.flat]}>
          {isLoading && !hasAnnouncements && (
            <>
              <View style={styles.skeletonRow}>
                <Skeleton variant="circle" />
                <View style={styles.skeletonText}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="90%" height={10} />
                </View>
              </View>
              <View style={styles.skeletonRow}>
                <Skeleton variant="circle" />
                <View style={styles.skeletonText}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" height={10} />
                </View>
              </View>
              <View style={styles.skeletonRow}>
                <Skeleton variant="circle" />
                <View style={styles.skeletonText}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="70%" height={10} />
                </View>
              </View>
            </>
          )}

          {error && !isLoading && !hasAnnouncements && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={40} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" onPress={refresh} variant="tonal" size="sm" />
            </View>
          )}

          {!isLoading && !error && !hasAnnouncements && (
            <EmptyState
              icon="campaign"
              title="No announcements"
              message="Cooperative announcements will appear here."
            />
          )}

          {hasAnnouncements &&
            announcements.map((notification, index) => (
              <AnnouncementRow
                key={notification.id}
                notification={notification}
                index={index}
                colors={colors}
                onPress={handleAnnouncementPress}
              />
            ))}
        </View>

        {/* Bottom padding for tab bar */}
        <SafeAreaView edges={["bottom"]} style={styles.bottomPadding} />
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
      paddingTop: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      backgroundColor: colors.surfaceContainer,
      marginBottom: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
    },
    offlineText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
      marginBottom: theme.spacing.lg,
    },
    rowContainer: {
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    rowTimestamp: {
      ...typography.styles.caption,
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    skeletonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    skeletonText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    errorText: {
      ...typography.styles.bodyText,
      color: colors.error,
      textAlign: "center",
    },
    bottomPadding: {
      height: 100,
    },
  });
