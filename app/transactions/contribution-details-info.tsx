import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { mockSavingsTransactions, formatCurrency } from "@/data/mockData";
import { getAllocationSummary } from "@/lib/utils/contributionAllocation";
import { AllocationBreakdown } from "@/components/savings/AllocationBreakdown";

interface DataRowProps {
  label: string;
  value: string;
  colors: typeof lightColors;
  copyable?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, colors, copyable = false }) => {
  const styles = createDataRowStyles(colors);

  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {copyable && (
        <TouchableOpacity
          onPress={handleCopy}
          style={styles.copyButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="content-copy" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createDataRowStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
    },
    label: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    value: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    copyButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
  });

export default function ContributionDetailsInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const [isDownloading, setIsDownloading] = useState(false);

  // Find transaction by ID
  const transaction =
    mockSavingsTransactions.find((t) => t.id === id) || mockSavingsTransactions[0];

  const allocationSummary = getAllocationSummary(Math.abs(transaction.amount));

  const handleBack = () => {
    router.back();
  };

  const handleCopyTransactionId = () => {
    Clipboard.setString(transaction.id);
    Alert.alert("Copied", "Transaction ID copied to clipboard");
  };

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
        message: `Contribution Receipt\n\nTransaction ID: ${transaction.id}\nAmount: ₦${formatCurrency(transaction.amount)}\nDate: ${transaction.date}\nStatus: ${transaction.status}`,
        title: "Contribution Receipt",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
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
            Transaction Details
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.transactionHeader}
        >
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <MaterialIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.statusText}>Completed</Text>
          </View>

          {/* Amount */}
          <Text style={styles.amount}>+₦{formatCurrency(transaction.amount)}</Text>

          {/* Transaction ID with Copy */}
          <TouchableOpacity
            onPress={handleCopyTransactionId}
            style={styles.transactionIdContainer}
          >
            <Text style={styles.transactionIdLabel}>Transaction ID</Text>
            <View style={styles.transactionIdRow}>
              <Text style={styles.transactionId}>{transaction.id}</Text>
              <MaterialIcons
                name="content-copy"
                size={16}
                color={colors.primary}
                style={styles.copyIcon}
              />
            </View>
          </TouchableOpacity>
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
          style={styles.sectionCard}
        >
          <Text style={styles.sectionTitle}>General Information</Text>

          {/* Bento Grid - First Row */}
          <View style={styles.bentoRow}>
            <View style={[styles.bentoItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={colors.primary}
                style={styles.bentoIcon}
              />
              <Text style={styles.bentoLabel}>Date</Text>
              <Text style={styles.bentoValue}>{transaction.date}</Text>
            </View>
            <View style={[styles.bentoItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons
                name="access-time"
                size={20}
                color={colors.primary}
                style={styles.bentoIcon}
              />
              <Text style={styles.bentoLabel}>Time</Text>
              <Text style={styles.bentoValue}>{transaction.time}</Text>
            </View>
            <View style={[styles.bentoItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons
                name="access-time"
                size={20}
                color={colors.primary}
                style={styles.bentoIcon}
              />
              <Text style={styles.bentoLabel}>Time</Text>
              <Text style={styles.bentoValue}>{transaction.time}</Text>
            </View>
          </View>

          {/* Bento Grid - Second Row */}
          <View style={styles.bentoRow}>
            <View style={[styles.bentoItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons
                name="category"
                size={20}
                color={colors.primary}
                style={styles.bentoIcon}
              />
              <Text style={styles.bentoLabel}>Type</Text>
              <Text style={styles.bentoValue}>{transaction.type}</Text>
            </View>
            <View style={[styles.bentoItem, { backgroundColor: colors.surface }]}>
              <MaterialIcons
                name="label"
                size={20}
                color={colors.primary}
                style={styles.bentoIcon}
              />
              <Text style={styles.bentoLabel}>Category</Text>
              <Text style={styles.bentoValue}>{transaction.category}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Data Rows */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.sectionCard}
        >
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          <DataRow
            label="Transaction ID"
            value={transaction.id}
            colors={colors}
            copyable
          />

          <DataRow label="Transaction Type" value={transaction.type} colors={colors} />

          <DataRow label="Category" value={transaction.category} colors={colors} />

          <DataRow label="Status" value={transaction.status} colors={colors} />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.actionsContainer}
        >
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadReceipt}
            disabled={isDownloading}
            activeOpacity={0.8}
          >
            {isDownloading ? (
              <Text style={styles.downloadButtonText}>Downloading...</Text>
            ) : (
              <>
                <MaterialIcons name="download" size={20} color={colors.onPrimary} />
                <Text style={styles.downloadButtonText}>Download Receipt</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <MaterialIcons name="share" size={20} color={colors.primary} />
            <Text style={styles.shareButtonText}>Share</Text>
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
    transactionHeader: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.success}10`,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.base,
      gap: 4,
      marginBottom: theme.spacing.base,
    },
    statusText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.success,
    },
    amount: {
      fontFamily: font("display", "extrabold"),
      fontSize: 32,
      color: colors.success,
      marginBottom: theme.spacing.base,
    },
    transactionIdContainer: {
      alignItems: "center",
    },
    transactionIdLabel: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    transactionIdRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    transactionId: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    copyIcon: {
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    bentoRow: {
      flexDirection: "row",
      gap: theme.spacing.base,
      marginBottom: theme.spacing.base,
    },
    bentoItem: {
      flex: 1,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    bentoIcon: {
      marginBottom: theme.spacing.sm,
    },
    bentoLabel: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    bentoValue: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    noteContainer: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    noteIcon: {
      marginTop: 2,
    },
    noteText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      fontStyle: "italic",
      lineHeight: theme.typography.lineHeight.relaxed * typography.size.sm,
    },
    actionsContainer: {
      gap: theme.spacing.base,
      marginTop: theme.spacing.base,
    },
    downloadButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    downloadButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    shareButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    shareButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.primary,
    },
    bottomPadding: {
      height: 100,
    },
  });
