import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Badge } from "@/components/common/Badge";
import { Money } from "@/components/common/Money";
import { TransactionDetailCard } from "@/components/savings/TransactionDetailCard";
import { useContributions } from "@/hooks/useContributions";
import { getAllocationSummary } from "@/lib/utils/contributionAllocation";
import { AllocationBreakdown } from "@/components/savings/AllocationBreakdown";

export default function ContributionDetailsInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const [isDownloading, setIsDownloading] = useState(false);

  // Served from the contributions query cache populated by the list screen.
  const { contributions, isLoading } = useContributions();
  const contribution = contributions.find((c) => c.id === id);

  const handleBack = () => {
    router.back();
  };

  if (!contribution) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ScreenHeader title="Transaction Details" onBack={handleBack} />
        <View style={styles.notFoundContainer}>
          <MaterialIcons
            name={isLoading ? "hourglass-empty" : "search-off"}
            size={48}
            color={colors.outlineVariant}
          />
          <Text style={styles.notFoundText}>
            {isLoading ? "Loading transaction…" : "Transaction not found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const createdAt = new Date(contribution.created_at);
  const transaction = {
    id: contribution.id,
    amount: contribution.amount,
    date: createdAt.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: createdAt.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: "Contribution",
    category: "Savings",
    status: contribution.status,
  };

  const allocationSummary = getAllocationSummary(Math.abs(transaction.amount));

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDownloading(false);
    Alert.alert("Success", "Receipt downloaded successfully");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Contribution Receipt\n\nTransaction ID: ${transaction.id}\nAmount: ₦${transaction.amount.toLocaleString("en-NG")}\nDate: ${transaction.date}\nStatus: ${transaction.status}`,
        title: "Contribution Receipt",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Transaction Details" onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.amountSection}
        >
          <View style={styles.watermarkContainer}>
            <MaterialIcons
              name="account-balance"
              size={140}
              color={`${colors.primary}08`}
            />
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="savings" size={28} color={colors.primary} />
          </View>
          <Text style={styles.amountLabel}>Contribution Amount</Text>
          <Money
            amount={transaction.amount}
            size="xl"
            tone="success"
            signed
            style={styles.amountValue}
          />
          <Badge status="success" label="COMPLETED" />
        </Animated.View>

        {/* Allocation Breakdown */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <AllocationBreakdown
            amount={allocationSummary.total}
            allocation={allocationSummary.allocation}
            percentages={allocationSummary.percentages}
          />
        </Animated.View>

        {/* General Information */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.sectionCard, { marginTop: theme.spacing.base }]}
        >
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.detailsContainer}>
            <TransactionDetailCard
              icon="fingerprint"
              label="Transaction ID"
              value={transaction.id}
              showCopy
            />
            <TransactionDetailCard
              icon="calendar-today"
              label="Date & Time"
              value={`${transaction.date} • ${transaction.time}`}
            />
            <TransactionDetailCard icon="category" label="Type" value={transaction.type} />
            <TransactionDetailCard icon="label" label="Category" value={transaction.category} />
            <TransactionDetailCard
              icon="info"
              label="Status"
              value={transaction.status.toUpperCase()}
            />
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.actionsContainer}
        >
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            disabled={isDownloading}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="download" size={20} color={colors.onSurface} />
            <Text style={styles.actionButtonText}>
              {isDownloading ? "Downloading..." : "Download Receipt"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="share" size={20} color={colors.onSurface} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Padding */}
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
    notFoundContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.base,
      paddingHorizontal: theme.spacing.xl,
    },
    notFoundText: {
      ...typography.styles.bodyText,
      color: colors.onSurfaceVariant,
    },
    amountSection: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
      position: "relative",
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -20,
      right: -20,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.base,
    },
    amountLabel: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      letterSpacing: 2,
      marginBottom: theme.spacing.xs,
    },
    amountValue: {
      marginBottom: theme.spacing.base,
    },
    sectionCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    detailsContainer: {
      gap: theme.spacing.base,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: theme.spacing.base,
      marginTop: theme.spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    actionButtonText: {
      ...typography.styles.labelBold,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    bottomPadding: {
      height: 100,
    },
  });
