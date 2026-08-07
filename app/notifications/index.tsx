import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, Href } from "expo-router";
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
import { SummaryCards } from "@/components/notifications/SummaryCards";
import { NotificationMenu } from "@/components/notifications/NotificationMenu";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Notification,
  NotificationType,
  getRelativeTime,
} from "@/lib/types/notifications";

const TYPE_ICONS: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  loan: "account-balance-wallet",
  contribution: "calendar-month",
  dividend: "campaign",
  security: "security",
  meeting: "groups",
  announcement: "campaign",
};

const getTypeTint = (type: NotificationType, colors: typeof lightColors): string => {
  switch (type) {
    case "loan":
    case "meeting":
      return colors.info;
    case "contribution":
      return colors.warning;
    case "security":
      return colors.error;
    case "dividend":
      return colors.onSurfaceVariant;
    case "announcement":
      return colors.primaryBright;
  }
};

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
    skeletonList: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
      marginBottom: theme.spacing.lg,
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
      gap: theme.spacing.base,
    },
    errorText: {
      ...typography.styles.bodyText,
      color: colors.error,
      textAlign: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
    },
    markAllText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.primaryBright,
      textTransform: "uppercase",
      letterSpacing: 0.5,
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
    rowTrailing: {
      alignItems: "flex-end",
      gap: theme.spacing.xs,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryBright,
    },
    rowTimestamp: {
      ...typography.styles.caption,
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    actionButton: {
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceContainer,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.base,
      marginLeft: 56,
    },
    actionButtonText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.primaryBright,
    },
    loadMoreContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.base,
    },
    endOfUpdates: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["2xl"],
      opacity: 0.4,
    },
    archiveIconContainer: {
      width: 72,
      height: 72,
      borderRadius: theme.borderRadius.full,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.base,
    },
    endOfUpdatesText: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
    },
    bottomPadding: {
      height: 100,
    },
  });

interface NotificationRowProps {
  notification: Notification;
  index: number;
  colors: typeof lightColors;
  onPress: (notification: Notification) => void;
  onActionPress: (notification: Notification, route: string) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  index,
  colors,
  onPress,
  onActionPress,
}) => {
  const styles = createStyles(colors);
  const tint = getTypeTint(notification.type, colors);

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 50).duration(300)}
      style={styles.rowContainer}
    >
      <ListItem
        title={notification.title}
        subtitle={notification.message}
        leadingIcon={TYPE_ICONS[notification.type]}
        leadingColor={tint}
        chevron={false}
        onPress={() => onPress(notification)}
        trailing={
          <View style={styles.rowTrailing}>
            {!notification.isRead && <View style={styles.unreadDot} />}
            <Text style={styles.rowTimestamp}>
              {getRelativeTime(notification.timestamp)}
            </Text>
          </View>
        }
      />
      {notification.action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onActionPress(notification, notification.action!.route)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{notification.action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);
  const [showMenu, setShowMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    refresh,
    loadMore,
    isLoadingMore,
    hasMore,
    markRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);
  const hasNotifications = notifications.length > 0;
  const latestActivity = hasNotifications
    ? getRelativeTime(notifications[0].timestamp)
    : undefined;

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = (notification: Notification) => {
    markRead(notification.id);
    if (notification.type === "announcement") {
      router.push({
        pathname: "/notifications/announcement/[id]",
        params: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
        },
      });
    }
  };

  const handleActionPress = (notification: Notification, route: string) => {
    markRead(notification.id);
    if (route.startsWith("/")) {
      router.push(route as Href);
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(false);
    clearAll();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader
        title="Notifications"
        onBack={handleBack}
        rightAction={{ icon: "more-vert", onPress: () => setShowMenu(true) }}
      />

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

        {/* Summary */}
        <SummaryCards unreadCount={unreadCount} latestActivity={latestActivity} />

        {/* Loading skeleton */}
        {isLoading && !hasNotifications && (
          <View style={[styles.skeletonList, elevations.flat]}>
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
          </View>
        )}

        {/* Error */}
        {error && !isLoading && !hasNotifications && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.errorContainer}
          >
            <MaterialIcons name="error-outline" size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={refresh} variant="tonal" size="sm" />
          </Animated.View>
        )}

        {/* New (unread) */}
        {unreadNotifications.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New</Text>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.listCard, elevations.flat]}>
              {unreadNotifications.map((notification, index) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  index={index}
                  colors={colors}
                  onPress={handleNotificationPress}
                  onActionPress={handleActionPress}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Earlier (read) */}
        {readNotifications.length > 0 && (
          <Animated.View entering={FadeInUp.delay(350).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Earlier</Text>
            </View>
            <View style={[styles.listCard, elevations.flat]}>
              {readNotifications.map((notification, index) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  index={index + unreadNotifications.length}
                  colors={colors}
                  onPress={handleNotificationPress}
                  onActionPress={handleActionPress}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty */}
        {!isLoading && !error && !hasNotifications && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <EmptyState
              icon="notifications-off"
              title="No notifications"
              message="You're all caught up! Updates from your cooperative will appear here."
            />
          </Animated.View>
        )}

        {/* Load more / end of list */}
        {hasNotifications && hasMore && (
          <View style={styles.loadMoreContainer}>
            {isLoadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Button title="Load more" onPress={loadMore} variant="tonal" size="sm" />
            )}
          </View>
        )}
        {hasNotifications && !hasMore && (
          <Animated.View
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.endOfUpdates}
          >
            <View style={styles.archiveIconContainer}>
              <MaterialIcons
                name="archive"
                size={32}
                color={colors.onSurfaceVariant}
              />
            </View>
            <Text style={styles.endOfUpdatesText}>End of recent updates</Text>
          </Animated.View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Notification Menu */}
      <NotificationMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onClearAll={() => setShowClearConfirm(true)}
      />

      {/* Clear-all confirmation */}
      <ConfirmationModal
        visible={showClearConfirm}
        title="Clear all notifications?"
        message="This removes your entire notification history. This can't be undone."
        confirmText="Clear all"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </SafeAreaView>
  );
}
