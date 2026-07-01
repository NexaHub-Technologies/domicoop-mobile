import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    totalSection: {
      padding: theme.spacing["2xl"],
      minHeight: 140,
      justifyContent: "center",
    },
    totalLabel: {
      ...typography.styles.sectionLabel,
      color: colors.primaryFixed,
      marginBottom: theme.spacing.sm,
    },
    yearNote: {
      ...typography.styles.bodySmall,
      color: colors.primaryFixedDim,
      marginTop: theme.spacing.sm,
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
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);
  const allocationItems = getAllocationItems(colors);

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
        Contribution Summary
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
            style={styles.totalSection}
          >
            <Text style={styles.totalLabel}>Total Contributions</Text>
            {isLoading ? (
              <Skeleton variant="text" width={160} height={32} />
            ) : (
              <Money amount={totalBalance} size="xl" tone="onPrimary" />
            )}
            {!isLoading && yearBalance > 0 && (
              <Text style={styles.yearNote}>
                ₦{yearBalance.toLocaleString("en-NG", { maximumFractionDigits: 0 })} contributed this year
              </Text>
            )}
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
