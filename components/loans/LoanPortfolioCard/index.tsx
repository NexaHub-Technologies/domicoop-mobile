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

interface LoanPortfolioCardProps {
  totalDebt: number | null;
  activeCount: number;
  nextPayment: { date: string; amount: number; daysLeft: number } | null;
  isLoading?: boolean;
}

/**
 * Loans hero card — mirrors the contributions PortfolioCard anatomy (label,
 * hero amount, badge, divided footer with two columns) and the shared brand
 * gradient, so the loans tab reads as part of the same system.
 */
export const LoanPortfolioCard: React.FC<LoanPortfolioCardProps> = ({
  totalDebt,
  activeCount,
  nextPayment,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayDebt = totalDebt ?? 0;
  const badgeLabel =
    activeCount > 0
      ? `${activeCount} ACTIVE ${activeCount === 1 ? "LOAN" : "LOANS"}`
      : "NO ACTIVE LOANS";

  return (
    <AnimatedView entering={FadeInUp.duration(400)} style={styles.container}>
      <AnimatedView
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.card}
      >
        <LinearGradient
          colors={colors.brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardInner}
        >
          <View style={styles.patternOverlay} />

          <View style={styles.content}>
            <Text style={styles.label}>Total Debt</Text>

            <View style={styles.amountRow}>
              {isLoading && totalDebt === null ? (
                <Skeleton variant="text" width={160} height={32} />
              ) : (
                <Money amount={displayDebt} size="xl" tone="onPrimary" />
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View>
                <Text style={styles.footerLabel}>Next Payment</Text>
                <Text style={styles.footerValue}>
                  {nextPayment?.date || "—"}
                </Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.footerLabel}>
                  {nextPayment ? "Amount Due" : "Status"}
                </Text>
                {nextPayment ? (
                  <Money amount={nextPayment.amount} size="md" tone="onPrimary" />
                ) : (
                  <Text style={styles.footerValue}>All clear</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </AnimatedView>
    </AnimatedView>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    card: {
      borderRadius: theme.borderRadius["2xl"],
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    cardInner: {
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
    content: {
      zIndex: 1,
    },
    label: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
      marginBottom: theme.spacing.sm,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    badge: {
      backgroundColor: `${colors.onPrimary}33`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onPrimary,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: `${colors.onPrimary}1A`,
    },
    footerRight: {
      alignItems: "flex-end",
    },
    footerLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: `${colors.onPrimary}70`,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    footerValue: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
  });

export default LoanPortfolioCard;
