import React from "react";
import {
  View,
  Text,
  ScrollView,
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
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";
import { LoanPortfolioCard } from "@/components/loans/LoanPortfolioCard";
import { LoanCard } from "@/components/loans/LoanCard";
import { InsightsCard } from "@/components/loans/InsightsCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useLoans } from "@/hooks/useLoans";
import { useTheme, lightColors } from "@/contexts/ThemeContext";

export default function LoansScreen() {
  const router = useRouter();
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

  const activeCount = loans.filter((loan) => loan.status !== "completed").length;

  const onRefresh = React.useCallback(() => {
    refresh();
  }, [refresh]);

  const handleApplyForLoan = () => {
    router.push("/transactions/apply-for-loan");
  };

  const dynamicStyles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Loans" large />

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

        {/* Portfolio Hero */}
        <LoanPortfolioCard
          totalDebt={loans.length === 0 && isLoading ? null : totalDebt}
          activeCount={activeCount}
          nextPayment={nextPayment}
          isLoading={isLoading}
        />

        {/* Apply for New Loan */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={dynamicStyles.applyButtonWrap}
        >
          <Button
            title="Apply for a Loan"
            onPress={handleApplyForLoan}
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
            <Text style={dynamicStyles.loadingText}>Loading loans...</Text>
          </View>
        )}

        {!isLoading && error && loans.length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={dynamicStyles.errorText}>{error}</Text>
            <Button title="Retry" onPress={onRefresh} variant="tonal" size="sm" />
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

        {/* Active Loans */}
        {loans.length > 0 && (
          <>
            <View style={dynamicStyles.sectionHeader}>
              <Animated.Text entering={FadeIn.delay(300)} style={dynamicStyles.sectionTitle}>
                Active Loans
              </Animated.Text>
            </View>

            <View style={dynamicStyles.loansList}>
              {loans.map((loan, index) => (
                <LoanCard key={loan.id} loan={loan} index={index} />
              ))}
            </View>

            <InsightsCard />
          </>
        )}

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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: theme.spacing.base,
    },
    applyButtonWrap: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
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
    bottomPadding: {
      height: 100,
    },
  });
