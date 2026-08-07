import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";
import { ListItem } from "@/components/common/ListItem";
import { Money } from "@/components/common/Money";
import { EmptyState } from "@/components/common/EmptyState";
import { formatMonth } from "@/lib/utils/format";
import { contributionsApi } from "@/lib/api/contributions.api";
import { Contribution } from "@/lib/types/contributions";

export default function ContributionDetailsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Contribution Overview" />

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
            <Button
              title="Retry"
              onPress={() => fetchContributions()}
              variant="tonal"
              size="sm"
            />
          </Animated.View>
        )}

        {/* Overview Card */}
        {!isLoading && (
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.overviewCard}
          >
            <LinearGradient
              colors={colors.brandGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.overviewCardInner}
            >
              <View style={styles.watermarkContainer}>
                <MaterialIcons
                  name="account-balance"
                  size={140}
                  color={`${colors.onPrimary}10`}
                />
              </View>

              <View style={styles.iconContainer}>
                <MaterialIcons name="savings" size={28} color={colors.onPrimary} />
              </View>

              <Text style={styles.overviewTitle}>Total Contributions</Text>

              <Money amount={totalContributions} size="xl" tone="onPrimary" />

              <View style={styles.statusBadge}>
                <MaterialIcons name="check-circle" size={14} color={colors.onPrimary} />
                <Text style={styles.statusText}>ACTIVE</Text>
              </View>

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
            </LinearGradient>
          </Animated.View>
        )}

        {/* Add Contribution Button */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.addButtonWrap}
        >
          <Button
            title="Add Contribution"
            onPress={handleAddContribution}
            variant="primary"
            size="lg"
            icon="add-circle"
            iconPosition="left"
            fullWidth
          />
        </Animated.View>

        {/* Transaction History */}
        {contributions.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.historySection}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Transactions</Text>
              <Text style={styles.viewAllText}>View All</Text>
            </View>

            <View style={[styles.transactionsList, elevations.flat]}>
              {contributions.slice(0, 10).map((contribution) => (
                <ListItem
                  key={contribution.id}
                  title={formatMonth(contribution.month)}
                  subtitle={new Date(contribution.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  leadingIcon="savings"
                  leadingColor={getStatusColor(contribution.status)}
                  chevron={false}
                  onPress={() => handleTransactionPress(contribution.id)}
                  trailing={
                    <View style={styles.rowTrailing}>
                      <Money
                        amount={contribution.amount}
                        size="sm"
                        signed
                        style={{ color: getStatusColor(contribution.status) }}
                      />
                      <Text
                        style={[
                          styles.transactionStatus,
                          { color: getStatusColor(contribution.status) },
                        ]}
                      >
                        {contribution.status.toUpperCase()}
                      </Text>
                    </View>
                  }
                  style={styles.rowItem}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {!isLoading && contributions.length === 0 && !error && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <EmptyState
              icon="savings"
              title="No Contributions Yet"
              message="Start making contributions to build your savings with DOMICOOP."
            />
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    overviewCard: {
      borderRadius: theme.borderRadius["2xl"],
      marginBottom: theme.spacing.lg,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    overviewCardInner: {
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
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
      ...typography.styles.bodyMedium,
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
      marginBottom: theme.spacing.xs,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.onPrimary}20`,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.base,
      gap: 4,
      marginTop: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    statusText: {
      ...typography.styles.label,
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
      ...typography.styles.cardTitle,
      fontSize: typography.size.xl,
      color: colors.onPrimary,
      marginBottom: 2,
    },
    statLabel: {
      ...typography.styles.bodySmall,
      color: `${colors.onPrimary}80`,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: `${colors.onPrimary}20`,
    },
    addButtonWrap: {
      marginBottom: theme.spacing.lg,
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
      ...typography.styles.cardTitle,
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    viewAllText: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.primaryBright,
    },
    transactionsList: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
    },
    rowItem: {
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    rowTrailing: {
      alignItems: "flex-end",
    },
    transactionStatus: {
      ...typography.styles.caption,
      fontSize: typography.size.xs - 2,
      marginTop: 2,
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
      ...typography.styles.bodyText,
      color: colors.onSurfaceVariant,
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
      marginTop: theme.spacing.base,
    },
  });
