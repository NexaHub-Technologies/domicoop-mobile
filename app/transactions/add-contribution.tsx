import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";
import { AmountInput } from "@/components/forms/AmountInput";
import { DropdownSelect } from "@/components/forms/DropdownSelect";
import { Input } from "@/components/common/Input";
import { getContributionMonths, MIN_CONTRIBUTION_AMOUNT } from "@/constants/contributions";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { usePaystackPayment } from "@/hooks/usePaystackPayment";
import { contributionsApi } from "@/lib/api/contributions.api";
import { ApiError } from "@/lib/http";
import { InfoModal } from "@/components/modals/InfoModal";
import { getAllocationSummary } from "@/lib/utils/contributionAllocation";
import { AllocationBreakdown } from "@/components/savings/AllocationBreakdown";
import { parseNairaInput } from "@/lib/utils/currency";

export default function AddContributionScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const elevations = createElevation(colors);
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
    const numericAmount = parseNairaInput(amount) || 0;

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

    const numericAmount = parseNairaInput(amount) || 0;
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
          // The verify endpoint takes no notes; keep them on the Paystack
          // transaction so they aren't lost.
          ...(notes.trim()
            ? [
                {
                  display_name: "Notes",
                  variable_name: "notes",
                  value: notes.trim(),
                },
              ]
            : []),
        ],
      },
      onSuccess: async (response) => {
        // The server verifies the reference with Paystack and derives the
        // amount, member, and status from the verified transaction.
        let stored = false;
        // A verified charge under ₦5,000 is rejected with 422
        // { reason: "below_minimum" } — deterministic, so don't retry it and
        // tell the member exactly why (currency-contract.md).
        let belowMinimum = false;
        let suspended = false;
        try {
          const [yearStr] = month.split("-");
          const input = {
            reference: response.reference,
            month,
            year: parseInt(yearStr, 10),
          };
          // The charge can take a moment to settle after checkout;
          // verified: false is safe to retry.
          for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) await new Promise((r) => setTimeout(r, 2500));
            const result = await contributionsApi.verifyContribution(input);
            if (result.verified) {
              stored = true;
              break;
            }
          }
        } catch (storeError) {
          const reason =
            storeError instanceof ApiError &&
            storeError.body &&
            typeof storeError.body === "object"
              ? (storeError.body as { reason?: string }).reason
              : undefined;
          belowMinimum = reason === "below_minimum";
          suspended = storeError instanceof ApiError && storeError.status === 403;
          console.error(
            "Failed to verify contribution:",
            storeError,
            storeError instanceof ApiError ? storeError.body : "",
          );
        }

        setIsSubmitting(false);
        if (stored) {
          setShowSuccess(true);
        } else if (belowMinimum) {
          setErrorModal({
            visible: true,
            title: "Below Minimum Contribution",
            message:
              `Contributions must be at least ₦${MIN_CONTRIBUTION_AMOUNT.toLocaleString()}, but the payment came through for less, so it couldn't be recorded. ` +
              `Please contact support with this reference for a refund or top-up: ${response.reference}`,
          });
        } else if (suspended) {
          setErrorModal({
            visible: true,
            title: "Account Suspended",
            message:
              `Your account is suspended, so this contribution couldn't be recorded. ` +
              `Please contact support for assistance and share this transaction reference: ${response.reference}`,
          });
        } else {
          // Money left the member's account but the contribution wasn't
          // recorded — never present this as a plain success.
          setErrorModal({
            visible: true,
            title: "Payment Received, Not Yet Recorded",
            message:
              `Your payment was successful, but we couldn't record the contribution on your account right now. ` +
              `Please contact support and share this transaction reference so it can be applied: ${response.reference}`,
          });
        }
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

  const numericAmount = parseNairaInput(amount) || 0;
  const hasTypedAmount = amount.length > 0;
  const isBelowMinimum =
    hasTypedAmount && numericAmount > 0 && numericAmount < MIN_CONTRIBUTION_AMOUNT;
  const isAmountValid = !hasTypedAmount || numericAmount >= MIN_CONTRIBUTION_AMOUNT;
  const allocationSummary =
    numericAmount > 0 && !isBelowMinimum ? getAllocationSummary(numericAmount) : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScreenHeader title="Add Contribution" onBack={handleBack} />

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
            style={[styles.heroCard, elevations.raised]}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>Institutional Ledger</Text>
              <Text style={styles.heroTitle}>DOMICOOP</Text>
              <Text style={styles.heroDescription}>
                Secure Member Contribution Portal
              </Text>
            </View>
            <View style={styles.watermarkContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={120}
                color={`${colors.onPrimary}1A`}
              />
            </View>
          </Animated.View>

          {/* Form */}
          <View style={[styles.formContainer, elevations.flat]}>
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
              <Button
                title={isSubmitting ? "Opening Paystack..." : "Pay with Paystack"}
                onPress={handleSubmit}
                disabled={!isAmountValid || isSubmitting}
                variant="primary"
                size="lg"
                icon="lock"
                iconPosition="left"
                fullWidth
                style={styles.submitButton}
              />
            </Animated.View>
          </View>

          {/* Compliance Note */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(400)}
            style={[styles.complianceContainer, elevations.flat]}
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
      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="Contribution Recorded"
        message="Your payment was received and applied to your savings for the selected month."
      />

      {/* Error Modal */}
      <InfoModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
        icon="info"
        iconColor={colors.error}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    },
    heroContent: {
      zIndex: 1,
    },
    heroSubtitle: {
      ...typography.styles.sectionLabel,
      color: `${colors.onPrimary}80`,
      marginBottom: theme.spacing.xs,
    },
    heroTitle: {
      ...typography.styles.displayLarge,
      fontSize: typography.size["2xl"],
      lineHeight: 30,
      color: colors.onPrimary,
      marginBottom: 4,
    },
    heroDescription: {
      ...typography.styles.bodyText,
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
    },
    errorText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.error,
      marginTop: -theme.spacing.base,
      marginBottom: theme.spacing.base,
    },
    submitButton: {
      marginTop: theme.spacing.base,
    },
    complianceContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.base,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
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
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      marginBottom: 4,
    },
    complianceText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
    bottomPadding: {
      height: 40,
    },
  });
