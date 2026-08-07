import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { Badge, BadgeStatus } from "@/components/common/Badge";
import { Money } from "@/components/common/Money";
import type { Loan, LoanStatus } from "@/lib/types/loans";
import { getLoanTypeConfig } from "@/constants/loans";
import { formatCurrencyNoSign } from "@/lib/utils/format";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface LoanCardProps {
  loan: Loan;
  index: number;
}

const STATUS_META: Record<LoanStatus, { badge: BadgeStatus; label: string }> = {
  on_track: { badge: "success", label: "ON TRACK" },
  pending: { badge: "warning", label: "PENDING" },
  overdue: { badge: "error", label: "OVERDUE" },
  rejected: { badge: "error", label: "REJECTED" },
  completed: { badge: "neutral", label: "COMPLETED" },
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    loanInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    loanTitle: {
      ...typography.styles.bodyMedium,
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: 2,
    },
    loanId: {
      ...typography.styles.caption,
      color: colors.onSurfaceVariant,
    },
    amountsContainer: {
      flexDirection: "row",
      marginBottom: theme.spacing.lg,
    },
    amountItem: {
      flex: 1,
    },
    amountItemRight: {
      alignItems: "flex-end",
    },
    amountLabel: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    progressContainer: {
      marginBottom: theme.spacing.lg,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    progressLabel: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    progressPercent: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primaryBright,
      borderRadius: 3,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    nextPaymentContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    nextPaymentLabel: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    nextPaymentValue: {
      color: colors.onSurface,
      fontFamily: typography.styles.label.fontFamily,
    },
    manageButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: colors.surfaceContainer,
    },
    manageButtonText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.primaryBright,
    },
  });

export const LoanCard: React.FC<LoanCardProps> = ({ loan, index }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);
  const router = useRouter();
  const scale = useSharedValue(1);
  const purposeConfig = getLoanTypeConfig(loan.type);
  const statusMeta = STATUS_META[loan.status];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleManagePress = () => {
    router.push(`/loans/${loan.id}`);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 100).duration(400)}>
      <AnimatedTouchable
        onPress={handleManagePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, elevations.flat, animatedStyle]}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.loanInfo}>
            <View
              style={[styles.iconContainer, { backgroundColor: purposeConfig.bgColor }]}
            >
              <MaterialIcons
                name={purposeConfig.icon as any}
                size={20}
                color={purposeConfig.color}
              />
            </View>
            <View>
              <Text style={styles.loanTitle}>{loan.title}</Text>
              <Text style={styles.loanId}>ID: {loan.loanId}</Text>
            </View>
          </View>
          <Badge status={statusMeta.badge} label={statusMeta.label} dot={false} />
        </View>

        {/* Amounts */}
        <View style={styles.amountsContainer}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total Loan</Text>
            <Money amount={loan.totalAmount} size="md" />
          </View>
          <View style={[styles.amountItem, styles.amountItemRight]}>
            <Text style={styles.amountLabel}>Remaining</Text>
            <Money amount={loan.remainingBalance} size="md" style={{ color: colors.primaryBright }} />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Repayment progress</Text>
            <Text style={styles.progressPercent}>{loan.progress}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${loan.progress}%` }]} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.nextPaymentContainer}>
            <MaterialIcons name="calendar-today" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.nextPaymentLabel} numberOfLines={1}>
              Next:{" "}
              <Text style={styles.nextPaymentValue}>
                ₦{formatCurrencyNoSign(loan.nextPayment.amount)} on {loan.nextPayment.date}
              </Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.manageButton} onPress={handleManagePress}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default LoanCard;
