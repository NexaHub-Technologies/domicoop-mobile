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
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { SummaryCards } from "@/components/notifications/SummaryCards";
import { NotificationMenu } from "@/components/notifications/NotificationMenu";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification, getRelativeTime } from "@/lib/types/notifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
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
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(true)}>
            <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </Animated.View>

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
        {isOffline && (
          <View style={styles.offlineBanner}>
            <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.offlineText}>Showing cached data — offline</Text>
          </View>
        )}

        {/* Summary */}
        <SummaryCards unreadCount={unreadCount} latestActivity={latestActivity} />

        {/* Loading skeleton */}
        {isLoading && !hasNotifications && (
          <View style={styles.skeletonList}>
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
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
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New</Text>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notificationsList}>
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                  onActionPress={(route) => handleActionPress(notification, route)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Earlier (read) */}
        {readNotifications.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            <View style={styles.notificationsList}>
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                  onActionPress={(route) => handleActionPress(notification, route)}
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
                size={40}
                color={`${colors.onSurfaceVariant}40`}
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
    moreButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      minWidth: 44,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
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
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    skeletonList: {
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["2xl"],
      gap: theme.spacing.base,
    },
    errorText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.error,
      textAlign: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.base,
      paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
      marginBottom: theme.spacing.base,
      paddingHorizontal: theme.spacing.xs,
    },
    markAllText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.primaryBright,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    notificationsList: {
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
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
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.base,
    },
    endOfUpdatesText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    bottomPadding: {
      height: 100,
    },
  });
