import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { mockLoans, getLoanPurposeConfig, formatCurrencyNoSign } from "@/data/mockData";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LoanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);

  // Find loan by ID
  const loan = mockLoans.find((l) => l.id === id);

  if (!loan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.onSurface }}>Loan not found</Text>
      </SafeAreaView>
    );
  }

  const purposeConfig = getLoanPurposeConfig(loan.purpose);
  const paidAmount = loan.totalAmount - loan.remainingBalance;

  const handleBack = () => {
    router.back();
  };

  const handleMakePayment = () => {
    router.push("/transactions/make-payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Loan Details
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Loan Header Card */}
        <AnimatedView
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.loanHeaderCard}
        >
          <View style={[styles.purposeIcon, { backgroundColor: purposeConfig.bgColor }]}>
            <MaterialIcons
              name={purposeConfig.icon as any}
              size={32}
              color={purposeConfig.color}
            />
          </View>
          <Text style={styles.loanTitle}>{loan.title}</Text>
          <Text style={styles.loanId}>{loan.loanId}</Text>

          <View style={[styles.statusBadge, { backgroundColor: purposeConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: purposeConfig.color }]}>
              {loan.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </AnimatedView>

        {/* Balance Card */}
        <AnimatedView
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.balanceCard}
        >
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Amount</Text>
              <Text style={styles.balanceValue}>
                ₦{formatCurrencyNoSign(loan.totalAmount)}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Paid So Far</Text>
              <Text style={styles.balanceValuePaid}>
                ₦{formatCurrencyNoSign(paidAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingLabel}>Remaining Balance</Text>
            <Text style={styles.remainingValue}>
              ₦{formatCurrencyNoSign(loan.remainingBalance)}
            </Text>
          </View>
        </AnimatedView>

        {/* Progress Section */}
        <AnimatedView entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Repayment Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercent}>{loan.progress}% Complete</Text>
              <Text style={styles.progressText}>{loan.termMonths} months term</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${loan.progress}%`, backgroundColor: purposeConfig.color },
                ]}
              />
            </View>
          </View>
        </AnimatedView>

        {/* Loan Details */}
        <AnimatedView entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Information</Text>
          <View style={styles.detailsCard}>
            <DetailRow
              label="Monthly Payment"
              value={`₦${formatCurrencyNoSign(loan.monthlyPayment)}`}
            />
            <DetailRow label="Interest Rate" value={`${loan.interestRate}% APR`} />
            <DetailRow label="Start Date" value={loan.startDate} />
            <DetailRow
              label="Next Payment"
              value={`₦${formatCurrencyNoSign(loan.nextPayment.amount)} on ${loan.nextPayment.date}`}
            />
          </View>
        </AnimatedView>

        {/* Make Payment Button */}
        <AnimatedView
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.actionContainer}
        >
          <TouchableOpacity style={styles.paymentButton} onPress={handleMakePayment}>
            <MaterialIcons name="payment" size={20} color={colors.onPrimary} />
            <Text style={styles.paymentButtonText}>Make a Payment</Text>
          </TouchableOpacity>
        </AnimatedView>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.base,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      minWidth: 44,
    },
    headerTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
    },
    scrollView: {
      flex: 1,
    },
    loanHeaderCard: {
      backgroundColor: colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      padding: theme.spacing["2xl"],
      borderRadius: theme.borderRadius["2xl"],
      alignItems: "center",
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    purposeIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.base,
    },
    loanTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      marginBottom: 4,
    },
    loanId: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      marginBottom: theme.spacing.base,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    statusText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      letterSpacing: 0.5,
    },
    balanceCard: {
      backgroundColor: colors.primary,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing["2xl"],
      borderRadius: theme.borderRadius["2xl"],
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    balanceRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.lg,
    },
    balanceItem: {
      flex: 1,
      alignItems: "center",
    },
    balanceDivider: {
      width: 1,
      backgroundColor: `${colors.onPrimary}33`,
    },
    balanceLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: `${colors.onPrimary}70`,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    balanceValue: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onPrimary,
    },
    balanceValuePaid: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.successContainer,
    },
    remainingContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: `${colors.onPrimary}1A`,
    },
    remainingLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}90`,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    remainingValue: {
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size["2xl"],
      color: colors.onPrimary,
    },
    section: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: theme.spacing.base,
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    progressPercent: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    progressText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: colors.surfaceContainer,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    detailsCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    detailLabel: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    detailValue: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    actionContainer: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.base,
    },
    paymentButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    paymentButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    bottomPadding: {
      height: 40,
    },
  });
