import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { Money } from "@/components/common/Money";
import { Skeleton } from "@/components/common/Skeleton";
import type { ContributionAllocation } from "@/lib/utils/contributionAllocation";

const AnimatedView = Animated.createAnimatedComponent(View);

const getAllocationItems = (
  colors: typeof lightColors,
): {
  key: keyof ContributionAllocation;
  label: string;
  color: string;
  description: string;
}[] => [
  { key: "shares", label: "Shares", color: colors.primaryBright, description: "Fixed monthly" },
  { key: "social", label: "Social", color: colors.tertiary, description: "Fixed monthly" },
  { key: "savings", label: "Savings", color: colors.success, description: "Flexible (capped)" },
  { key: "deposit", label: "Deposit", color: colors.warning, description: "Overflow only" },
];

interface ContributionSummaryProps {
  totalBalance: number;
  yearBalance: number;
  allocationTotals: ContributionAllocation;
  isLoading: boolean;
  /** Outstanding loan balance — omit to render the contributions-only column. */
  totalDebt?: number;
  isDebtLoading?: boolean;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing["2xl"],
      paddingHorizontal: theme.spacing.base,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
      marginBottom: theme.spacing.lg,
      marginLeft: theme.spacing.xs,
    },
    card: {
      borderRadius: theme.borderRadius["2xl"],
      backgroundColor: colors.surface,
    },
    cardInner: {
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
    },
    positionSection: {
      padding: theme.spacing["2xl"],
    },
    positionEyebrow: {
      ...typography.styles.sectionLabel,
      color: `${colors.onPrimary}70`,
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    statColumn: {
      flex: 1,
    },
    statDivider: {
      width: 1,
      backgroundColor: `${colors.onPrimary}26`,
      marginHorizontal: theme.spacing.lg,
    },
    statIconChip: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${colors.onPrimary}1F`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.sm,
    },
    statLabel: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs - 2,
      color: `${colors.onPrimary}90`,
      marginBottom: 4,
    },
    statCaption: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: `${colors.onPrimary}70`,
      marginTop: 4,
    },
    viewLoansRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 4,
    },
    viewLoansText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 1,
      color: colors.onPrimary,
    },
    debtClear: {
      ...typography.styles.bodyMedium,
      fontSize: typography.size.md,
      color: colors.onPrimary,
    },
    bodySection: {
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    yearLabel: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    barContainer: {
      height: 6,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 3,
      flexDirection: "row",
      overflow: "hidden",
    },
    barSegment: {
      height: "100%",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      ...typography.styles.bodyMedium,
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    description: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
    },
    valueContainer: {
      alignItems: "flex-end",
    },
    percent: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    totalAttributedLabel: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
  });

export const ContributionSummary: React.FC<ContributionSummaryProps> = ({
  totalBalance,
  yearBalance,
  allocationTotals,
  isLoading,
  totalDebt,
  isDebtLoading = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);
  const allocationItems = getAllocationItems(colors);
  const showLoansColumn = totalDebt !== undefined;
  const hasDebt = (totalDebt ?? 0) > 0;

  const handleViewLoans = () => {
    router.push("/(tabs)/loans");
  };

  const totalAttributed =
    allocationTotals.shares +
    allocationTotals.social +
    allocationTotals.savings +
    allocationTotals.deposit;

  const percentages = {
    shares: yearBalance > 0 ? (allocationTotals.shares / yearBalance) * 100 : 0,
    social: yearBalance > 0 ? (allocationTotals.social / yearBalance) * 100 : 0,
    savings: yearBalance > 0 ? (allocationTotals.savings / yearBalance) * 100 : 0,
    deposit: yearBalance > 0 ? (allocationTotals.deposit / yearBalance) * 100 : 0,
  };

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeIn.delay(300)} style={styles.sectionTitle}>
        Your Financial Snapshot
      </Animated.Text>

      <AnimatedView
        entering={FadeInUp.delay(350).duration(400)}
        style={[styles.card, elevations.glowLg]}
      >
        <View style={styles.cardInner}>
          <LinearGradient
            colors={colors.brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.positionSection}
          >
            <Text style={styles.positionEyebrow}>Your Position with DOMICOOP</Text>

            <View style={styles.statsRow}>
              {/* Contributions — what the member has built up */}
              <View style={styles.statColumn}>
                <View style={styles.statIconChip}>
                  <MaterialIcons name="savings" size={16} color={colors.onPrimary} />
                </View>
                <Text style={styles.statLabel}>CONTRIBUTIONS</Text>
                {isLoading ? (
                  <Skeleton variant="text" width={110} height={22} />
                ) : (
                  <Money amount={totalBalance} size="md" tone="onPrimary" />
                )}
                {!isLoading && yearBalance > 0 && (
                  <Text style={styles.statCaption} numberOfLines={1}>
                    ₦{yearBalance.toLocaleString("en-NG", { maximumFractionDigits: 0 })} this year
                  </Text>
                )}
              </View>

              {showLoansColumn && <View style={styles.statDivider} />}

              {/* Loan balance — what the member owes back */}
              {showLoansColumn && (
                <TouchableOpacity
                  style={styles.statColumn}
                  onPress={handleViewLoans}
                  activeOpacity={0.7}
                >
                  <View style={styles.statIconChip}>
                    <MaterialIcons
                      name="account-balance-wallet"
                      size={16}
                      color={colors.onPrimary}
                    />
                  </View>
                  <Text style={styles.statLabel}>LOAN BALANCE</Text>
                  {isDebtLoading ? (
                    <Skeleton variant="text" width={90} height={22} />
                  ) : hasDebt ? (
                    <Money amount={totalDebt ?? 0} size="md" tone="onPrimary" />
                  ) : (
                    <Text style={styles.debtClear}>All clear</Text>
                  )}
                  <View style={styles.viewLoansRow}>
                    <Text style={styles.viewLoansText}>
                      {hasDebt ? "View loans" : "Apply for one"}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={14}
                      color={colors.onPrimary}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {!isLoading && yearBalance > 0 && (
            <View style={styles.bodySection}>
              <Text style={styles.yearLabel}>This Year’s Allocation</Text>

              <View style={styles.barContainer}>
                {allocationItems.map((item) => {
                  const value = allocationTotals[item.key];
                  if (value <= 0) return null;
                  return (
                    <View
                      key={item.key}
                      style={[
                        styles.barSegment,
                        { flex: value, backgroundColor: item.color },
                      ]}
                    />
                  );
                })}
              </View>

              {allocationItems.map((item) => {
                const value = allocationTotals[item.key];
                const pct = percentages[item.key];
                return (
                  <View key={item.key} style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <View style={styles.labelContainer}>
                      <Text style={styles.label}>{item.label}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                    <View style={styles.valueContainer}>
                      <Money amount={value} size="sm" />
                      <Text style={styles.percent}>{pct.toFixed(1)}%</Text>
                    </View>
                  </View>
                );
              })}

              {totalAttributed > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalAttributedLabel}>Total Attributed</Text>
                  <Money amount={totalAttributed} size="sm" style={{ color: colors.primaryBright }} />
                </View>
              )}
            </View>
          )}

          {!isLoading && yearBalance === 0 && (
            <View style={styles.bodySection}>
              <Text style={styles.yearLabel}>This Year’s Allocation</Text>
              <Text style={styles.description}>
                No contributions yet this year. Make a contribution to see how it is allocated.
              </Text>
            </View>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

export default ContributionSummary;
