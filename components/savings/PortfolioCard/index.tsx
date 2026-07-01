import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { Money } from "@/components/common/Money";
import { Skeleton } from "@/components/common/Skeleton";

const AnimatedView = Animated.createAnimatedComponent(View);

interface PortfolioCardProps {
  totalSavings: number | null;
  paidThisMonth: boolean;
  currentMonth: string | null;
  isLoading?: boolean;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    balanceCard: {
      borderRadius: theme.borderRadius["2xl"],
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    balanceCardInner: {
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      overflow: "hidden",
      position: "relative",
    },
    patternOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 200,
      height: 200,
      backgroundColor: `${colors.onPrimary}0D`,
      borderRadius: 100,
    },
    balanceContent: {
      zIndex: 1,
    },
    balanceLabel: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
      marginBottom: theme.spacing.sm,
    },
    balanceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    growthBadge: {
      backgroundColor: `${colors.onPrimary}33`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    growthText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onPrimary,
    },
    progressContainer: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: `${colors.onPrimary}1A`,
    },
    progressInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.base,
    },
    progressLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: `${colors.onPrimary}70`,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    progressValue: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    monthSection: {
      alignItems: "flex-end",
    },
    monthValue: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
  });

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  totalSavings,
  paidThisMonth,
  currentMonth,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayTotal = totalSavings ?? 0;
  const displayMonth = currentMonth
    ? new Date(currentMonth + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <AnimatedView entering={FadeInUp.duration(400)} style={styles.container}>
      <AnimatedView
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.balanceCard}
      >
        <LinearGradient
          colors={colors.brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCardInner}
        >
        <View style={styles.patternOverlay} />

        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Total Contributions</Text>

          <View style={styles.balanceRow}>
            {isLoading && totalSavings === null ? (
              <Skeleton variant="text" width={160} height={32} />
            ) : (
              <Money amount={displayTotal} size="xl" tone="onPrimary" />
            )}
            <View style={styles.growthBadge}>
              <Text style={styles.growthText}>
                {paidThisMonth ? "PAID THIS MONTH" : "NOT PAID"}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <View>
                <Text style={styles.progressLabel}>Current Month</Text>
                <Text style={styles.progressValue}>{displayMonth}</Text>
              </View>
              <View style={styles.monthSection}>
                <Text style={styles.progressLabel}>Status</Text>
                <Text style={styles.monthValue}>
                  {paidThisMonth ? "Contribution Made" : "No Contribution Yet"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        </LinearGradient>
      </AnimatedView>
    </AnimatedView>
  );
};

export default PortfolioCard;