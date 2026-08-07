import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { getRelativeTime } from "@/lib/types/notifications";

export default function AnnouncementDetailScreen() {
  const router = useRouter();
  const { title, message, timestamp } = useLocalSearchParams<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
  }>();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

  const handleBack = () => {
    router.back();
  };

  const relativeTime = timestamp ? getRelativeTime(timestamp) : "";
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Announcement" onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Announcement Card */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.card, elevations.flat]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="campaign" size={28} color={colors.primaryBright} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title || "Announcement"}</Text>

          {/* Date */}
          <View style={styles.dateRow}>
            <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.dateText}>
              {relativeTime}
              {formattedDate ? ` — ${formattedDate}` : ""}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          <Text style={styles.body}>{message || "No content available."}</Text>
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...typography.styles.cardTitle,
      fontSize: typography.size.xl,
      lineHeight: 28,
      color: colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    dateText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginBottom: theme.spacing.lg,
    },
    body: {
      ...typography.styles.bodyText,
      color: colors.onSurface,
      lineHeight: typography.size.base * 1.6,
    },
    bottomPadding: {
      height: 40,
    },
  });
