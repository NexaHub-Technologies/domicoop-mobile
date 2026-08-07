import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { typography } from '@/constants/typography';
import { createElevation } from '@/constants/theme';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';
import { AmountInput } from '@/components/forms/AmountInput';
import { PurposeSelector } from '@/components/forms/PurposeSelector';
import { TermSlider } from '@/components/forms/TermSlider';
import { LoanCalculator } from '@/components/forms/LoanCalculator';
import { Input } from '@/components/common/Input';
import { SuccessModal } from '@/components/modals/SuccessModal/index';
import { InfoModal } from '@/components/modals/InfoModal';
import { loanConfig, calculateLoan } from '@/constants/loans';
import { loansApi, LoanApplicationRejection } from '@/lib/api/loans.api';
import type { LoanType, InsufficientContributionsError, ActiveLoanExistsError } from '@/lib/types/loans';
import { parseNairaInput, toApiAmount } from '@/lib/utils/currency';

const MIN_PURPOSE_LENGTH = 10;

export default function ApplyForLoanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const elevations = createElevation(colors);

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<LoanType | null>(null);
  const [purpose, setPurpose] = useState('');
  const [term, setTerm] = useState(12);
  const [interestRate, setInterestRate] = useState(loanConfig.defaultInterestRate);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    type?: string;
    purpose?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [eligibilityError, setEligibilityError] =
    useState<InsufficientContributionsError | null>(null);
  const [activeLoanError, setActiveLoanError] =
    useState<ActiveLoanExistsError | null>(null);

  // Calculate loan details
  const loanDetails = useMemo(() => {
    const numericAmount = parseNairaInput(amount) || 0;
    return calculateLoan(numericAmount, term, interestRate);
  }, [amount, term, interestRate]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { amount?: string; type?: string; purpose?: string } = {};
    const numericAmount = parseNairaInput(amount) || 0;

    if (!amount || numericAmount < loanConfig.minAmount) {
      newErrors.amount = `Minimum loan amount is ₦${loanConfig.minAmount.toLocaleString()}`;
    } else if (numericAmount > loanConfig.maxAmount) {
      newErrors.amount = `Maximum loan amount is ₦${loanConfig.maxAmount.toLocaleString()}`;
    }

    if (!type) {
      newErrors.type = 'Please select a loan type';
    }

    if (purpose.trim().length < MIN_PURPOSE_LENGTH) {
      newErrors.purpose = `Please describe your purpose (at least ${MIN_PURPOSE_LENGTH} characters)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, type, purpose]);

  // Handle submission
  const handleSubmit = async () => {
    if (!validateForm() || !type) return;

    setIsSubmitting(true);
    try {
      // Whole Naira, ≤ 2dp, range-checked — the server validates with strict
      // t.Number and rejects strings / out-of-range values (currency-contract.md).
      await loansApi.apply({
        amount: toApiAmount(parseNairaInput(amount), loanConfig.minAmount),
        purpose: purpose.trim(),
        type,
        tenure_months: term,
      });
      // Refresh the loans list so the new pending application shows up.
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setShowSuccess(true);
    } catch (err) {
      if (err instanceof LoanApplicationRejection) {
        if (err.reason === 'insufficient_contributions') {
          setEligibilityError(err.data as InsufficientContributionsError);
        } else if (err.reason === 'active_loan_exists') {
          setActiveLoanError(err.data as ActiveLoanExistsError);
        }
      } else {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Could not submit your application. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.replace('/(tabs)/loans');
  };

  // Dismiss eligibility error
  const handleDismissEligibilityError = () => {
    setEligibilityError(null);
  };

  // Dismiss active loan error
  const handleDismissActiveLoanError = () => {
    setActiveLoanError(null);
  };

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <ScreenHeader title="Loan Application" onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <Text style={styles.heroSubtitle}>DOMICOOP Cooperative</Text>
              <Text style={styles.heroTitle}>Apply for a Loan</Text>
              <Text style={styles.heroDescription}>
                Complete the form below to submit your request. Most decisions
                are made within 24 hours.
              </Text>
            </View>
            <View style={styles.watermarkContainer}>
              <MaterialIcons
                name="account-balance"
                size={120}
                color={`${colors.onPrimary}1A`}
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
                error={errors.amount}
              />
            </Animated.View>

            {/* Loan Type */}
            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
              <PurposeSelector
                selectedType={type}
                onSelectType={(next) => {
                  setType(next);
                  if (errors.type) setErrors((e) => ({ ...e, type: undefined }));
                }}
              />
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </Animated.View>

            {/* Purpose Description */}
            <Animated.View entering={FadeInUp.delay(350).duration(400)}>
              <Input
                label="Purpose"
                placeholder="Briefly describe what this loan is for…"
                value={purpose}
                onChangeText={(text) => {
                  setPurpose(text);
                  if (errors.purpose) setErrors((e) => ({ ...e, purpose: undefined }));
                }}
                multiline
                numberOfLines={3}
                error={errors.purpose}
              />
            </Animated.View>

            {/* Term Slider */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <TermSlider value={term} onValueChange={setTerm} />
            </Animated.View>

            {/* Loan Calculator */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <LoanCalculator
                monthlyPayment={loanDetails.monthlyPayment}
                totalRepayment={loanDetails.totalRepayment}
                totalInterest={loanDetails.totalInterest}
                interestRate={interestRate}
                onInterestRateChange={setInterestRate}
              />
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInUp.delay(600).duration(400)}>
              {isSubmitting ? (
                <View style={[styles.submitButton, styles.submitButtonDisabled]}>
                  <ActivityIndicator color={colors.onPrimary} />
                </View>
              ) : (
                <Button
                  title="Apply for Loan"
                  onPress={handleSubmit}
                  variant="primary"
                  size="lg"
                  icon="send"
                  iconPosition="left"
                  fullWidth
                />
              )}
            </Animated.View>
          </View>

          {/* Compliance Note */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(400)}
            style={[styles.complianceContainer, elevations.flat]}
          >
            <View style={styles.complianceIcon}>
              <MaterialIcons name="verified-user" size={24} color={colors.primary} />
            </View>
            <View style={styles.complianceTextContainer}>
              <Text style={styles.complianceTitle}>Fast & Secure Review</Text>
              <Text style={styles.complianceText}>
                Most loan decisions are made within 24 hours. By applying, you
                agree to DOMICOOP&apos;s Terms of Service and Privacy Policy.
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
        title="Loan Request Submitted"
        message="Most decisions are made within 24 hours. We'll notify you once your application is reviewed."
      />

      {/* Error Modal */}
      <InfoModal
        visible={submitError !== null}
        onClose={() => setSubmitError(null)}
        icon="info"
        iconColor={colors.error}
        title="Application Failed"
        message={submitError ?? ''}
        primaryButtonText="Try Again"
      />

      {/* Insufficient Contributions Modal */}
      <InfoModal
        visible={eligibilityError !== null}
        onClose={handleDismissEligibilityError}
        icon="info"
        iconColor={colors.error}
        title="Not Enough Contributions"
        message={
          eligibilityError
            ? `You need ${eligibilityError.eligibility.short_by} more verified contribution(s) to apply for a loan. Currently ${eligibilityError.eligibility.verified_count}/${eligibilityError.eligibility.required_count} contributions verified.`
            : ''
        }
        primaryButtonText="OK"
        onPrimaryPress={handleDismissEligibilityError}
      />

      {/* Active Loan Exists Error */}
      <InfoModal
        visible={activeLoanError !== null}
        onClose={handleDismissActiveLoanError}
        icon="info"
        iconColor={colors.error}
        title="Active Loan Exists"
        message="You already have an active loan. Please repay or close it before applying for a new one."
        primaryButtonText="OK"
        onPrimaryPress={handleDismissActiveLoanError}
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
      padding: theme.spacing['2xl'],
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      position: 'relative',
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
      fontSize: typography.size['2xl'],
      lineHeight: 30,
      color: colors.onPrimary,
      marginBottom: 4,
    },
    heroDescription: {
      ...typography.styles.bodyText,
      color: `${colors.onPrimary}90`,
    },
    watermarkContainer: {
      position: 'absolute',
      bottom: -24,
      right: -24,
      zIndex: 0,
    },
    formContainer: {
      gap: theme.spacing.lg,
    },
    errorText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.error,
      marginTop: theme.spacing.xs,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    complianceContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
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
      alignItems: 'center',
      justifyContent: 'center',
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
