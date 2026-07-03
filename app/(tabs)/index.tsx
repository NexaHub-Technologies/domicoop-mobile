import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/styles/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ContributionSummary } from '@/components/dashboard/ContributionSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TransactionList, RecentTransaction } from '@/components/dashboard/TransactionList';
import { useTheme } from '@/contexts/ThemeContext';
import { useContributions } from '@/hooks/useContributions';
import { computeAllocationTotals } from '@/lib/utils/contributionAllocation';
import { formatMonth } from '@/lib/utils/format';

export default function DashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const {
    contributions,
    totalBalance,
    yearBalance,
    isLoading: isContributionsLoading,
    isRefreshing,
    error,
    isOffline,
    refresh: refreshContributions,
  } = useContributions();

  const allocationTotals = computeAllocationTotals(contributions);

  const recentTransactions: RecentTransaction[] = contributions.slice(0, 5).map((c) => ({
    id: c.id,
    type: 'contribution',
    category: 'savings' as const,
    title: formatMonth(c.month),
    amount: c.amount,
    date: c.created_at,
    status: c.status,
  }));

  const isLoading = isContributionsLoading;

  const onRefresh = React.useCallback(() => {
    refreshContributions();
  }, [refreshContributions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Fixed Header */}
      <DashboardHeader />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {/* Contribution Summary - Total & Allocation Breakdown */}
        <ContributionSummary
          totalBalance={totalBalance}
          yearBalance={yearBalance}
          allocationTotals={allocationTotals}
          isLoading={isContributionsLoading}
        />

        {/* Quick Actions - Deposit & Apply */}
        <QuickActions />

        {/* Recent Transactions */}
        <TransactionList
          transactions={recentTransactions}
          isLoading={isLoading}
          isOffline={isOffline}
          error={error}
          onRetry={onRefresh}
        />
        
        {/* Bottom padding for tab bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.base,
  },
  bottomPadding: {
    height: 100,
  },
});