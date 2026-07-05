import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
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
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Announcement
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Announcement Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="campaign" size={28} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title || "Announcement"}</Text>

          {/* Date */}
          <View style={styles.dateRow}>
            <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.dateText}>
              {relativeTime}{formattedDate ? ` — ${formattedDate}` : ""}
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing["2xl"],
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      marginBottom: theme.spacing.sm,
      lineHeight: 28,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    dateText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginBottom: theme.spacing.lg,
    },
    body: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      lineHeight: typography.size.base * 1.6,
    },
    bottomPadding: {
      height: 40,
    },
  });
