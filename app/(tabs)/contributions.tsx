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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ListItem } from "@/components/common/ListItem";
import { Money } from "@/components/common/Money";
import { PortfolioCard } from "@/components/savings/PortfolioCard";
import { formatMonth } from "@/lib/utils/format";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { useContributions } from "@/hooks/useContributions";
import { useSavingsSummary } from "@/hooks/useSavingsSummary";
import { Contribution } from "@/lib/types/contributions";

const getStatusColor = (status: string, colors: typeof lightColors): string => {
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

interface TransactionItemProps {
  contribution: Contribution;
  index: number;
  colors: typeof lightColors;
  onPress: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  contribution,
  index,
  colors,
  onPress,
}) => {
  const amountColor = getStatusColor(contribution.status, colors);
  const dynamicStyles = createTransactionStyles(colors);

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 50).duration(300)}
      style={dynamicStyles.rowContainer}
    >
      <ListItem
        title={formatMonth(contribution.month)}
        subtitle={`${contribution.month.split("-")[0]} Contribution`}
        leadingIcon="savings"
        leadingColor={amountColor}
        chevron={false}
        onPress={() => onPress(contribution.id)}
        trailing={
          <View style={dynamicStyles.rowTrailing}>
            <Money amount={contribution.amount} size="sm" style={{ color: amountColor }} />
            <Text style={[dynamicStyles.rowStatus, { color: amountColor }]}>
              {contribution.status.toUpperCase()}
            </Text>
          </View>
        }
      />
    </Animated.View>
  );
};

const VISIBLE_COUNT = 5;

export default function SavingsScreen() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const { colors, isDarkMode } = useTheme();
  const elevations = createElevation(colors);

  const {
    contributions,
    totalBalance,
    isLoading: isLoadingContributions,
    isRefreshing: isRefreshingContributions,
    error: contributionsError,
    isOffline,
    refresh: refreshContributions,
  } = useContributions();

  const {
    summary,
    isLoading: isLoadingSummary,
    isRefreshing: isRefreshingSummary,
    refresh: refreshSummary,
  } = useSavingsSummary();

  const isRefreshing = isRefreshingContributions || isRefreshingSummary;
  const isLoading = isLoadingContributions && contributions.length === 0;

  const onRefresh = React.useCallback(() => {
    Promise.all([refreshContributions(), refreshSummary()]);
  }, [refreshContributions, refreshSummary]);

  const handleAddContribution = () => {
    router.push("/transactions/add-contribution");
  };

  const handleTransactionPress = (id: string) => {
    router.push(`/contributions/${id}`);
  };

  const handleRetry = () => {
    refreshContributions();
    refreshSummary();
  };

  const dynamicStyles = React.useMemo(() => createStyles(colors), [colors]);

  const displayedContributions = showAll
    ? contributions
    : contributions.slice(0, VISIBLE_COUNT);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Contributions" large />

      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isOffline && !isLoading && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={dynamicStyles.offlineBanner}
          >
            <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
            <Text style={dynamicStyles.offlineText}>Showing cached data — offline</Text>
          </Animated.View>
        )}

        <PortfolioCard
          totalSavings={totalBalance}
          paidThisMonth={summary?.paid_this_month ?? false}
          currentMonth={summary?.current_month ?? null}
          isLoading={isLoadingSummary}
        />

        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={dynamicStyles.addButtonWrap}
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

        {isLoading && (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading contributions...</Text>
          </View>
        )}

        {contributionsError && !isLoading && contributions.length === 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={dynamicStyles.errorContainer}
          >
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={dynamicStyles.errorText}>{contributionsError}</Text>
            <Button title="Retry" onPress={handleRetry} variant="tonal" size="sm" />
          </Animated.View>
        )}

        {!isLoading && !contributionsError && contributions.length > 0 && (
          <View style={dynamicStyles.historySection}>
            <View style={dynamicStyles.historyHeader}>
              <Animated.Text
                entering={FadeIn.delay(250)}
                style={dynamicStyles.historyTitle}
              >
                Transaction History
              </Animated.Text>
            </View>

            <View style={[dynamicStyles.transactionsList, elevations.flat]}>
              {displayedContributions.map((contribution, index) => (
                <TransactionItem
                  key={contribution.id}
                  contribution={contribution}
                  index={index}
                  colors={colors}
                  onPress={handleTransactionPress}
                />
              ))}
            </View>

            {contributions.length > VISIBLE_COUNT && !showAll && (
              <TouchableOpacity
                style={dynamicStyles.viewAllButton}
                onPress={() => setShowAll(true)}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.viewAllText}>
                  View All Transactions ({contributions.length})
                </Text>
                <MaterialIcons name="expand-more" size={20} color={colors.primaryBright} />
              </TouchableOpacity>
            )}

            {showAll && contributions.length > VISIBLE_COUNT && (
              <TouchableOpacity
                style={dynamicStyles.viewAllButton}
                onPress={() => setShowAll(false)}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.viewAllText}>Show Less</Text>
                <MaterialIcons name="expand-less" size={20} color={colors.primaryBright} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isLoading && !contributionsError && contributions.length === 0 && (
          <EmptyState
            icon="savings"
            title="No Contributions Yet"
            message={`Your contribution balance is ₦${totalBalance.toLocaleString("en-NG")}. Start making contributions to build your savings with DOMICOOP.`}
            action={{ label: "Add First Contribution", onPress: handleAddContribution }}
          />
        )}

        <SafeAreaView edges={["bottom"]} style={dynamicStyles.bottomPadding} />
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
      paddingTop: theme.spacing.base,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      backgroundColor: colors.surfaceContainer,
      marginHorizontal: theme.spacing.lg,
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
    addButtonWrap: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
    },
    loadingText: {
      ...typography.styles.bodyText,
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.base,
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
    historySection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    historyTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
    },
    transactionsList: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.lg,
    },
    viewAllText: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.primaryBright,
    },
    bottomPadding: {
      height: 100,
    },
  });

const createTransactionStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    rowContainer: {
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    rowTrailing: {
      alignItems: "flex-end",
    },
    rowStatus: {
      ...typography.styles.caption,
      fontSize: typography.size.xs - 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 2,
    },
  });
