import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { formatCurrencyNoSign } from "@/lib/utils/format";
import type { ContributionAllocation } from "@/lib/utils/contributionAllocation";

interface AllocationBreakdownProps {
  amount: number;
  allocation: ContributionAllocation;
  percentages: {
    shares: number;
    social: number;
    savings: number;
    deposit: number;
  };
}

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

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    headerText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
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
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    description: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs - 1,
      color: colors.secondary,
    },
    valueContainer: {
      alignItems: "flex-end",
    },
    value: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    percent: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs - 1,
      color: colors.secondary,
    },
    barContainer: {
      height: 6,
      backgroundColor: `${colors.outline}20`,
      borderRadius: 3,
      flexDirection: "row",
      overflow: "hidden",
    },
    barSegment: {
      height: "100%",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: theme.spacing.sm,
    },
    totalLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    totalValue: {
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size.lg,
      color: colors.primary,
    },
    zeroState: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.secondary,
      fontStyle: "italic",
    },
  });

export const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({
  allocation,
  percentages,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contribution Allocation</Text>
      </View>

      <View style={styles.barContainer}>
        {getAllocationItems(colors).map((item) => {
          const value = allocation[item.key];
          if (value <= 0) return null;
          return (
            <View
              key={item.key}
              style={[
                styles.barSegment,
                {
                  flex: value,
                  backgroundColor: item.color,
                },
              ]}
            />
          );
        })}
      </View>

      {getAllocationItems(colors).map((item) => {
        const value = allocation[item.key];
        const pct = percentages[item.key];
        return (
          <View key={item.key} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={styles.valueContainer}>
              {value > 0 ? (
                <>
                  <Text style={styles.value}>
                    ₦{formatCurrencyNoSign(value)}
                  </Text>
                  <Text style={styles.percent}>{pct.toFixed(1)}%</Text>
                </>
              ) : (
                <Text style={styles.zeroState}>₦0</Text>
              )}
            </View>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Credited</Text>
        <Text style={styles.totalValue}>
          ₦{formatCurrencyNoSign(
            allocation.shares + allocation.social + allocation.savings + allocation.deposit,
          )}
        </Text>
      </View>
    </View>
  );
};

export default AllocationBreakdown;
