import React from "react";
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
import { LoanSummaryStats } from "@/components/loans/LoanSummaryStats";
import { LoanCard } from "@/components/loans/LoanCard";
import { InsightsCard } from "@/components/loans/InsightsCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useLoans } from "@/hooks/useLoans";
import { useTheme, lightColors } from "@/contexts/ThemeContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoansScreen() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const { colors, isDarkMode } = useTheme();
  const {
    loans,
    totalDebt,
    nextPayment,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    refresh,
  } = useLoans();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onRefresh = React.useCallback(() => {
    refresh();
  }, [refresh]);

  const handleApplyForLoan = () => {
    router.push("/transactions/apply-for-loan");
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={[dynamicStyles.container]} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.backButton} />
          <Text style={[dynamicStyles.headerTitle, { color: colors.primary }]}>
            Loans
          </Text>
          <View style={dynamicStyles.backButton} />
        </View>
      </Animated.View>

      {/* Scrollable Content */}
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
          <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.offlineBanner}>
            <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
            <Text style={dynamicStyles.offlineText}>Showing cached data — offline</Text>
          </Animated.View>
        )}

        {/* Summary Stats */}
        <LoanSummaryStats totalDebt={totalDebt} nextPayment={nextPayment} />

        {/* Apply for New Loan Button */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <AnimatedTouchable
            onPress={handleApplyForLoan}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[dynamicStyles.applyButton, animatedStyle]}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.applyButtonContent}>
              <View style={dynamicStyles.applyIconContainer}>
                <MaterialIcons name="add-circle" size={28} color={colors.onPrimary} />
              </View>
              <View style={dynamicStyles.applyTextContainer}>
                <Text style={dynamicStyles.applyButtonTitle}>Apply for New Loan</Text>
                <Text style={dynamicStyles.applyButtonSubtitle}>
                  Instant approval for qualified members
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onPrimary} />
          </AnimatedTouchable>
        </Animated.View>

        {/* Active Loans Section */}
        <View style={dynamicStyles.sectionHeader}>
          <Animated.Text entering={FadeIn.delay(300)} style={dynamicStyles.sectionTitle}>
            Active Loans
          </Animated.Text>
        </View>

        {isLoading && (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading loans...</Text>
          </View>
        )}

        {!isLoading && error && loans.length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={dynamicStyles.errorText}>{error}</Text>
            <TouchableOpacity style={dynamicStyles.retryButton} onPress={onRefresh}>
              <Text style={dynamicStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!isLoading && !error && loans.length === 0 && (
          <EmptyState
            icon="account-balance"
            title="No loans yet"
            message="Apply for a loan and it will show up here."
            action={{ label: "Apply for a Loan", onPress: handleApplyForLoan }}
          />
        )}

        {/* Loan Cards */}
        {loans.length > 0 && (
          <View style={dynamicStyles.loansList}>
            {loans.map((loan, index) => (
              <LoanCard key={loan.id} loan={loan} index={index} />
            ))}
          </View>
        )}

        {/* Insights Card */}
        {loans.length > 0 && <InsightsCard />}

        {/* Bottom padding for tab bar */}
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
    applyButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    applyButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
    },
    applyIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.onPrimary}33`,
      alignItems: "center",
      justifyContent: "center",
    },
    applyTextContainer: {
      gap: 2,
    },
    applyButtonTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    applyButtonSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}90`,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.base,
    },
    sectionTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    loansList: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
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
    bottomPadding: {
      height: 100,
    },
  });
