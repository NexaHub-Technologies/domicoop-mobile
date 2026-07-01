import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { getTotalDebt, getNextPayment, formatCurrencyNoSign } from "@/data/mockData";

const AnimatedView = Animated.createAnimatedComponent(View);

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    debtCard: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      minHeight: 100,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    },
    debtContent: {
      zIndex: 1,
    },
    debtLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.primaryFixed,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
    },
    debtAmount: {
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size.xl,
      color: colors.onPrimary,
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -10,
      right: -10,
      zIndex: 0,
    },
    dueCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      minHeight: 100,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
      justifyContent: "space-between",
    },
    dueLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
    },
    dueDate: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.primary,
    },
    warningContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: theme.spacing.xs,
    },
    warningText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.error,
    },
  });

export const LoanSummaryStats: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const totalDebt = getTotalDebt();
  const nextPayment = getNextPayment();

  return (
    <AnimatedView entering={FadeInUp.duration(400)} style={styles.container}>
      {/* Total Debt Card */}
      <View style={styles.debtCard}>
        <View style={styles.debtContent}>
          <Text style={styles.debtLabel}>Total Debt</Text>
          <Text style={styles.debtAmount}>₦{formatCurrencyNoSign(totalDebt)}</Text>
        </View>
        <View style={styles.watermarkContainer}>
          <MaterialIcons
            name="account-balance"
            size={80}
            color={`${colors.onPrimary}1A`}
          />
        </View>
      </View>

      {/* Next Due Card */}
      <View style={styles.dueCard}>
        <View>
          <Text style={styles.dueLabel}>Next Due</Text>
          <Text style={styles.dueDate}>{nextPayment?.date || "No active loans"}</Text>
        </View>
        {nextPayment && nextPayment.daysLeft <= 14 && (
          <View style={styles.warningContainer}>
            <MaterialIcons name="warning" size={14} color={colors.error} />
            <Text style={styles.warningText}>{nextPayment.daysLeft} days left</Text>
          </View>
        )}
      </View>
    </AnimatedView>
  );
};

export default LoanSummaryStats;
