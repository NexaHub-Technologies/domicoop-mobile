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
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Notification } from "@/lib/types/notifications";

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);

  const {
    announcements,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    refresh,
  } = useAnnouncements();

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
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Announcements
          </Text>
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

        {/* Loading skeleton */}
        {isLoading && announcements.length === 0 && (
          <View style={styles.skeletonList}>
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
          </View>
        )}

        {/* Error */}
        {error && !isLoading && announcements.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.errorContainer}
          >
            <MaterialIcons name="error-outline" size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Announcements list */}
        {announcements.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <View style={styles.list}>
              {announcements.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleAnnouncementPress(notification)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty */}
        {!isLoading && !error && announcements.length === 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <EmptyState
              icon="campaign"
              title="No announcements"
              message="Cooperative announcements will appear here."
            />
          </Animated.View>
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
      shadowOffset: { width: 0, height: 2 },
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
    list: {
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    bottomPadding: {
      height: 100,
    },
  });
