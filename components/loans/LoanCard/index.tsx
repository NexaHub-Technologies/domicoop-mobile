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
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import type { Loan } from "@/lib/types/loans";
import { getLoanPurposeConfig } from "@/constants/loans";
import { formatCurrencyNoSign } from "@/lib/utils/format";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface LoanCardProps {
  loan: Loan;
  index: number;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
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
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    loanTitle: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: 2,
    },
    loanId: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
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
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    amountValue: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    amountValuePrimary: {
      color: colors.primary,
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
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    progressPercent: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onSurface,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: colors.surfaceContainer,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
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
    },
    nextPaymentLabel: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    nextPaymentValue: {
      color: colors.onSurface,
      fontFamily: font("body", "semibold"),
    },
    manageButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    manageButtonText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.primary,
    },
  });

export const LoanCard: React.FC<LoanCardProps> = ({ loan, index }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const scale = useSharedValue(1);
  const purposeConfig = getLoanPurposeConfig(loan.purpose);

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

  const getStatusStyle = () => {
    switch (loan.status) {
      case "on_track":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
          label: "On Track",
        };
      case "pending":
        return {
          bg: colors.primaryFixedDim,
          text: colors.primary,
          label: "Pending",
        };
      case "overdue":
        return {
          bg: colors.errorContainer,
          text: colors.error,
          label: "Overdue",
        };
      case "completed":
        return {
          bg: colors.secondaryContainer,
          text: colors.secondary,
          label: "Completed",
        };
      default:
        return {
          bg: colors.surfaceContainer,
          text: colors.onSurfaceVariant,
          label: "Active",
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 100).duration(400)}>
      <AnimatedTouchable
        onPress={handleManagePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, animatedStyle]}
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
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Amounts */}
      <View style={styles.amountsContainer}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Total Loan</Text>
          <Text style={styles.amountValue}>
            ₦{formatCurrencyNoSign(loan.totalAmount)}
          </Text>
        </View>
        <View style={[styles.amountItem, styles.amountItemRight]}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={[styles.amountValue, styles.amountValuePrimary]}>
            ₦{formatCurrencyNoSign(loan.remainingBalance)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Repayment Progress</Text>
          <Text style={styles.progressPercent}>{loan.progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${loan.progress}%` }]} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.nextPaymentContainer}>
          <MaterialIcons
            name="calendar-today"
            size={14}
            color={colors.onSurfaceVariant}
          />
          <Text style={styles.nextPaymentLabel}>
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
