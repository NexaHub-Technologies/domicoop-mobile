import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { AmountInput } from "@/components/forms/AmountInput";
import { DropdownSelect } from "@/components/forms/DropdownSelect";
import { Input } from "@/components/common/Input";
import { getContributionMonths, MIN_CONTRIBUTION_AMOUNT } from "@/data/mockData";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { usePaystackPayment } from "@/hooks/usePaystackPayment";
import { contributionsApi } from "@/lib/api/contributions.api";
import { InfoModal } from "@/components/modals/InfoModal";
import { getAllocationSummary } from "@/lib/utils/contributionAllocation";
import { AllocationBreakdown } from "@/components/savings/AllocationBreakdown";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AddContributionScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors);
  const { initiateContributionPayment } = usePaystackPayment();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  // Form state
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    month?: string;
  }>({});

  const contributionMonths = getContributionMonths();

  const validateForm = () => {
    const newErrors: { amount?: string; month?: string } = {};
    const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;

    if (!amount || numericAmount < MIN_CONTRIBUTION_AMOUNT) {
      newErrors.amount = `Minimum contribution is ₦${MIN_CONTRIBUTION_AMOUNT.toLocaleString()}`;
    }

    if (!month) {
      newErrors.month = "Please select a contribution month";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
    const selectedMonthLabel =
      contributionMonths.find((m) => m.value === month)?.label || month;

    initiateContributionPayment({
      amount: numericAmount,
      metadata: {
        custom_fields: [
          {
            display_name: "Contribution Month",
            variable_name: "contribution_month",
            value: selectedMonthLabel,
          },
        ],
      },
      onSuccess: async (_response, verification) => {
        if (verification?.status) {
          try {
            const [yearStr, monthStr] = month.split("-");
            const year = parseInt(yearStr, 10);
            const formattedMonth = `${yearStr}-${monthStr}`;

            const allocation = getAllocationSummary(
              Math.round(verification.data.amount / 100),
            );

            const payload = {
              amount: Math.round(verification.data.amount / 100),
              month: formattedMonth,
              year: year,
              transaction_ref: verification.data.reference,
              member_no: verification.data.metadata?.member_id,
              member_email: verification.data.customer.email,
              payment_method: verification.data.channel,
              payment_status: verification.data.status as
                | "pending"
                | "verified"
                | "rejected",
              notes: notes.trim() || undefined,
              allocation: allocation.allocation,
            };

            await contributionsApi.storeVerifiedContribution(payload);
          } catch (storeError) {
            console.error("Failed to store verified contribution:", storeError);
          }
        }

        setIsSubmitting(false);
        setShowSuccess(true);
      },
      onCancel: () => {
        setIsSubmitting(false);
        setErrorModal({
          visible: true,
          title: "Payment Cancelled",
          message: "You cancelled the payment. Please try again when ready.",
        });
      },
      onError: (error) => {
        setIsSubmitting(false);
        setErrorModal({
          visible: true,
          title: "Payment Failed",
          message: "There was an error processing your payment. Please try again.",
        });
        console.error("Payment error:", error);
      },
    });
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.replace("/(tabs)/contributions");
  };

  const handleBack = () => {
    router.back();
  };

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const hasTypedAmount = amount.length > 0;
  const isBelowMinimum =
    hasTypedAmount && numericAmount > 0 && numericAmount < MIN_CONTRIBUTION_AMOUNT;
  const isAmountValid = !hasTypedAmount || numericAmount >= MIN_CONTRIBUTION_AMOUNT;
  const allocationSummary =
    numericAmount > 0 && !isBelowMinimum ? getAllocationSummary(numericAmount) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Add Contribution
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Card */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>Institutional Ledger</Text>
              <Text style={styles.heroTitle}>DOMICOP</Text>
              <Text style={styles.heroDescription}>
                Secure Member Contribution Portal
              </Text>
            </View>
            <View style={styles.watermarkContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={120}
                color={
                  `${colors.onPrimary}1A`
                }
              />
            </View>
          </Animated.View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Amount Input */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <AmountInput
                value={amount}
                onChangeText={setAmount}
                error={isBelowMinimum ? `Minimum contribution is ₦${MIN_CONTRIBUTION_AMOUNT.toLocaleString()}` : undefined}
                label="Contribution Amount"
                minAmount={MIN_CONTRIBUTION_AMOUNT}
                maxAmount={10000000}
              />
            </Animated.View>

            {/* Month Selection */}
            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
              <DropdownSelect
                label="Contribution Month"
                value={month}
                options={contributionMonths}
                onSelect={setMonth}
                placeholder="Select month"
                icon="calendar-month"
              />
              {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
            </Animated.View>

            {/* Notes Textarea */}
            <Animated.View entering={FadeInUp.delay(350).duration(400)}>
              <Input
                label="Notes (Optional)"
                placeholder="Add any additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{ marginTop: theme.spacing.base }}
              />
            </Animated.View>

            {/* Allocation Breakdown */}
            {allocationSummary && (
              <Animated.View entering={FadeInUp.delay(450).duration(400)}>
                <AllocationBreakdown
                  amount={allocationSummary.total}
                  allocation={allocationSummary.allocation}
                  percentages={allocationSummary.percentages}
                />
              </Animated.View>
            )}

            {/* Submit Button */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <AnimatedTouchable
                onPress={handleSubmit}
                disabled={!isAmountValid || isSubmitting}
                style={[styles.submitButton, (!isAmountValid || isSubmitting) && styles.submitButtonDisabled]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <>
                    <MaterialIcons name="lock" size={20} color={colors.onPrimary} />
                    <Text style={styles.submitButtonText}>Opening Paystack...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="lock" size={20} color={colors.onPrimary} />
                    <Text style={styles.submitButtonText}>Pay with Paystack</Text>
                  </>
                )}
              </AnimatedTouchable>
            </Animated.View>
          </View>

          {/* Compliance Note */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.complianceContainer}
          >
            <View style={styles.complianceIcon}>
              <MaterialIcons name="verified-user" size={24} color={colors.primary} />
            </View>
            <View style={styles.complianceTextContainer}>
              <Text style={styles.complianceTitle}>Powered by Paystack</Text>
              <Text style={styles.complianceText}>
                Payments are securely processed via Paystack. Supports card, bank
                transfer, USSD, and QR code payments. All transactions are encrypted and
                protected.
              </Text>
            </View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal visible={showSuccess} onClose={handleSuccessClose} />

      {/* Error Modal */}
      <InfoModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
        icon="info"
        iconColor={colors.error}
      />
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
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
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing["2xl"],
      marginBottom: theme.spacing.lg,
      overflow: "hidden",
      position: "relative",
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    heroContent: {
      zIndex: 1,
    },
    heroSubtitle: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}80`,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: theme.spacing.xs,
    },
    heroTitle: {
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size["2xl"],
      color: colors.onPrimary,
      marginBottom: 4,
    },
    heroDescription: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -24,
      right: -24,
      zIndex: 0,
    },
    formContainer: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: `${colors.outline}50`,
    },
    errorText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.error,
      marginTop: -theme.spacing.base,
      marginBottom: theme.spacing.base,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.base,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    complianceContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.base,
      backgroundColor: `${colors.surface}80`,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
    },
    complianceIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
    },
    complianceTextContainer: {
      flex: 1,
    },
    complianceTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xs,
      color: colors.onSurface,
      marginBottom: 4,
    },
    complianceText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs - 1,
      color: colors.secondary,
      lineHeight: 18,
    },
    bottomPadding: {
      height: 40,
    },
  });
