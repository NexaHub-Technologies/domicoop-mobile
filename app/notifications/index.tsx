import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
import { mockNotifications, Notification } from "@/data/mockData";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showMenu, setShowMenu] = useState(false);
  const styles = createStyles(colors);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleBack = () => {
    router.back();
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read (visual state change only)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );
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
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(true)}>
            <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <SummaryCards unreadCount={unreadNotifications.length} />

        {/* Today Section */}
        {unreadNotifications.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today</Text>
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notificationsList}>
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Earlier Section */}
        {readNotifications.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            <View style={styles.notificationsList}>
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.emptyState}
          >
            <View style={styles.emptyIconContainer}>
              <MaterialIcons
                name="notifications-off"
                size={48}
                color={colors.onSurfaceVariant}
              />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You&apos;re all caught up!</Text>
          </Animated.View>
        )}

        {/* End of Updates */}
        {notifications.length > 0 && (
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
        onClearAll={handleClearAll}
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
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    notificationsList: {
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
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
