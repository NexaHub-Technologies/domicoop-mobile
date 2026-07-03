import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import { contributionsApi } from "@/lib/api/contributions.api";
import { Contribution } from "@/lib/types/contributions";

export default function ContributionDetailsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const currentYear = new Date().getFullYear();
      const response = await contributionsApi.getMyContributions({ year: currentYear });
      setContributions(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch contributions:", err);
      setError(err?.message || "Failed to load contributions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalTransactions = contributions.length;
  const verifiedContributions = contributions.filter(
    (c) => c.status === "verified",
  ).length;
  const pendingContributions = contributions.filter((c) => c.status === "pending").length;

  const handleRefresh = () => {
    fetchContributions(true);
  };

  const handleAddContribution = () => {
    router.push("/transactions/add-contribution");
  };

  const handleTransactionPress = (contributionId: string) => {
    router.push(`/transactions/contribution-details-info?id=${contributionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return colors.success;
      case "pending":
        return colors.warning;
      case "rejected":
        return colors.error;
      default:
        return colors.onSurfaceVariant;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.backButton} />
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Contribution Overview
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Loading State */}
        {isLoading && contributions.length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading contributions...</Text>
          </Animated.View>
        )}

        {/* Error State */}
        {error && contributions.length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchContributions()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Overview Card */}
        {!isLoading && (
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.overviewCard}
          >
            {/* Watermark */}
            <View style={styles.watermarkContainer}>
              <MaterialIcons
                name="account-balance"
                size={140}
                color={`${colors.onPrimary}10`}
              />
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="savings" size={28} color={colors.onPrimary} />
            </View>

            {/* Title */}
            <Text style={styles.overviewTitle}>Total Contributions</Text>

            {/* Amount */}
            <Text style={styles.overviewAmount}>
              ₦{formatCurrency(totalContributions)}
            </Text>

            {/* Status */}
            <View style={styles.statusBadge}>
              <MaterialIcons name="check-circle" size={14} color={colors.success} />
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalTransactions}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{verifiedContributions}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pendingContributions}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Add Contribution Button */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddContribution}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-circle" size={20} color={colors.onPrimary} />
            <Text style={styles.addButtonText}>Add Contribution</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transaction History */}
        {contributions.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.historySection}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              {contributions.slice(0, 10).map((contribution) => (
                <TouchableOpacity
                  key={contribution.id}
                  style={styles.transactionItem}
                  onPress={() => handleTransactionPress(contribution.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getStatusColor(contribution.status)}10` },
                      ]}
                    >
                      <MaterialIcons
                        name="savings"
                        size={20}
                        color={getStatusColor(contribution.status)}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        {formatMonth(contribution.month)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(contribution.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getStatusColor(contribution.status) },
                      ]}
                    >
                      +₦{formatCurrency(contribution.amount)}
                    </Text>
                    <Text
                      style={[
                        styles.transactionStatus,
                        { color: getStatusColor(contribution.status) },
                      ]}
                    >
                      {contribution.status.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {!isLoading && contributions.length === 0 && !error && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.emptyContainer}
          >
            <MaterialIcons name="savings" size={64} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No Contributions Yet</Text>
            <Text style={styles.emptyText}>
              Start making contributions to build your savings with DOMICOP.
            </Text>
          </Animated.View>
        )}

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
    overviewCard: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      overflow: "hidden",
      position: "relative",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -20,
      right: -20,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${colors.onPrimary}20`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.base,
    },
    overviewTitle: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
      marginBottom: theme.spacing.xs,
    },
    overviewAmount: {
      fontFamily: font("display", "bold"),
      fontSize: theme.spacing["3xl"],
      color: colors.onPrimary,
      marginBottom: theme.spacing.base,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.onPrimary}20`,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.base,
      gap: 4,
      marginBottom: theme.spacing.lg,
    },
    statusText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onPrimary,
    },
    statsGrid: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: `${colors.onPrimary}20`,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onPrimary,
      marginBottom: 2,
    },
    statLabel: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}80`,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: `${colors.onPrimary}20`,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    addButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    historySection: {
      marginBottom: theme.spacing.lg,
    },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.base,
    },
    historyTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    viewAllText: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.primary,
    },
    transactionsList: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    transactionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    transactionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: 2,
    },
    transactionDate: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    transactionRight: {
      alignItems: "flex-end",
    },
    transactionAmount: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      marginBottom: 2,
    },
    transactionStatus: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
    },
    bottomPadding: {
      height: 100,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
    },
    loadingText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
      gap: theme.spacing.base,
    },
    errorText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.error,
      textAlign: "center",
      marginTop: theme.spacing.base,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.base,
    },
    retryButtonText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
      gap: theme.spacing.base,
    },
    emptyTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      marginTop: theme.spacing.base,
    },
    emptyText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      paddingHorizontal: theme.spacing.xl,
      lineHeight: 22,
    },
  });
