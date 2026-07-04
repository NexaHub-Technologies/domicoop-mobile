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
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { PortfolioCard } from "@/components/savings/PortfolioCard";
import { formatCurrency, formatMonth } from "@/lib/utils/format";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { useContributions } from "@/hooks/useContributions";
import { useSavingsSummary } from "@/hooks/useSavingsSummary";
import { Contribution } from "@/lib/types/contributions";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const amountColor = getStatusColor(contribution.status, colors);

  const dynamicStyles = createTransactionStyles(colors);

  return (
    <Animated.View entering={FadeInUp.delay(300 + index * 50).duration(300)}>
      <AnimatedTouchable
        onPress={() => onPress(contribution.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[dynamicStyles.transactionItem, animatedStyle]}
        activeOpacity={0.7}
      >
        <View style={dynamicStyles.leftSection}>
          <View
            style={[dynamicStyles.iconContainer, { backgroundColor: `${amountColor}10` }]}
          >
            <MaterialIcons name="savings" size={20} color={amountColor} />
          </View>
          <View style={dynamicStyles.textContainer}>
            <Text style={dynamicStyles.transactionTitle}>
              {formatMonth(contribution.month)}
            </Text>
            <Text style={dynamicStyles.transactionDate}>
              {contribution.month.split("-")[0]} Contribution
            </Text>
          </View>
        </View>
        <View style={dynamicStyles.rightSection}>
          <Text style={[dynamicStyles.transactionAmount, { color: amountColor }]}>
            {formatCurrency(contribution.amount)}
          </Text>
          <Text style={[dynamicStyles.transactionStatus, { color: amountColor }]}>
            {contribution.status.toUpperCase()}
          </Text>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const VISIBLE_COUNT = 5;

export default function SavingsScreen() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const { colors, isDarkMode } = useTheme();

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
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.backButton} />
          <Text style={[dynamicStyles.headerTitle, { color: colors.primary }]}>
            Contributions
          </Text>
          <View style={dynamicStyles.backButton} />
        </View>
      </Animated.View>

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

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <AnimatedTouchable
            onPress={handleAddContribution}
            style={dynamicStyles.addButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-circle" size={20} color={colors.onPrimary} />
            <Text style={dynamicStyles.addButtonText}>Add Contribution</Text>
          </AnimatedTouchable>
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
            <TouchableOpacity style={dynamicStyles.retryButton} onPress={handleRetry}>
              <Text style={dynamicStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
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

            <View style={dynamicStyles.transactionsList}>
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
                <MaterialIcons name="expand-more" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}

            {showAll && contributions.length > VISIBLE_COUNT && (
              <TouchableOpacity
                style={dynamicStyles.viewAllButton}
                onPress={() => setShowAll(false)}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.viewAllText}>Show Less</Text>
                <MaterialIcons name="expand-less" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isLoading && !contributionsError && contributions.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={dynamicStyles.emptyContainer}
          >
            <View style={dynamicStyles.emptyIconContainer}>
              <MaterialIcons name="savings" size={64} color={colors.outlineVariant} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>No Contributions Yet</Text>
            <Text style={dynamicStyles.emptyText}>
              Your contribution balance is ₦{formatCurrency(totalBalance)}.
              {"\n"}Start making contributions to build your savings with DOMICOOP.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.emptyButton}
              onPress={handleAddContribution}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-circle" size={20} color={colors.onPrimary} />
              <Text style={dynamicStyles.emptyButtonText}>Add First Contribution</Text>
            </TouchableOpacity>
          </Animated.View>
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
      paddingTop: theme.spacing.lg,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      backgroundColor: `${colors.primary}10`,
      marginHorizontal: theme.spacing.lg,
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
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      marginHorizontal: theme.spacing.lg,
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
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
    },
    loadingText: {
      fontFamily: font("body", "regular"),
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
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
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
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.lg,
    },
    viewAllText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: colors.primary,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
      paddingHorizontal: theme.spacing.lg,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${colors.primary}08`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    emptyButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    bottomPadding: {
      height: 100,
    },
  });

const createTransactionStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    transactionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    textContainer: {
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
    rightSection: {
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
    },
  });
