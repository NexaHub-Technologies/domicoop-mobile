import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { font } from "@/constants/theme";
import { typography } from '@/constants/typography';
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ApplyForLoanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Loan Application
          </Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

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
            style={styles.heroCard}
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
              <AnimatedTouchable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color={colors.onPrimary} />
                    <Text style={styles.submitButtonText}>Apply for Loan</Text>
                  </>
                )}
              </AnimatedTouchable>
            </Animated.View>
          </View>

          {/* Compliance Note */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(400)}
            style={styles.complianceContainer}
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

      {/* Insufficient Contributions Banner */}
      {eligibilityError && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={styles.eligibilityBanner}
        >
          <View style={styles.eligibilityBannerHeader}>
            <MaterialIcons name="info-outline" size={20} color={colors.error} />
            <Text style={styles.eligibilityBannerTitle}>Not Enough Contributions</Text>
          </View>
          <Text style={styles.eligibilityBannerText}>
            You need {eligibilityError.eligibility.short_by} more verified
            contribution(s) to apply for a loan.
          </Text>
          <View style={styles.eligibilityProgressContainer}>
            <View style={styles.eligibilityProgressBar}>
              <View
                style={[
                  styles.eligibilityProgressFill,
                  {
                    width: `${Math.min(
                      100,
                      (eligibilityError.eligibility.verified_count /
                        eligibilityError.eligibility.required_count) *
                        100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.eligibilityProgressLabel}>
              {eligibilityError.eligibility.verified_count}/
              {eligibilityError.eligibility.required_count} contributions verified
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDismissEligibilityError}
            style={styles.eligibilityBannerClose}
          >
            <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </Animated.View>
      )}

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      fontFamily: font('display', 'bold'),
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
      padding: theme.spacing['2xl'],
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      position: 'relative',
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
      fontFamily: font('body', 'bold'),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}80`,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: theme.spacing.xs,
    },
    heroTitle: {
      fontFamily: font('display', 'extrabold'),
      fontSize: typography.size['2xl'],
      color: colors.onPrimary,
      marginBottom: 4,
    },
    heroDescription: {
      fontFamily: font('body', 'regular'),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}90`,
      lineHeight: 20,
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
      fontFamily: font('body', 'regular'),
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
      fontFamily: font('display', 'bold'),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    complianceContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    complianceTextContainer: {
      flex: 1,
    },
    complianceTitle: {
      fontFamily: font('display', 'bold'),
      fontSize: typography.size.xs,
      color: colors.onSurface,
      marginBottom: 4,
    },
    complianceText: {
      fontFamily: font('body', 'regular'),
      fontSize: typography.size.xs - 1,
      color: colors.secondary,
      lineHeight: 18,
    },
    eligibilityBanner: {
      backgroundColor: colors.errorContainer,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.error}30`,
    },
    eligibilityBannerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    eligibilityBannerTitle: {
      fontFamily: font('display', 'bold'),
      fontSize: typography.size.sm,
      color: colors.error,
    },
    eligibilityBannerText: {
      fontFamily: font('body', 'regular'),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      marginBottom: theme.spacing.base,
      lineHeight: 20,
    },
    eligibilityProgressContainer: {
      gap: theme.spacing.xs,
    },
    eligibilityProgressBar: {
      height: 8,
      backgroundColor: `${colors.error}20`,
      borderRadius: 4,
      overflow: 'hidden',
    },
    eligibilityProgressFill: {
      height: '100%',
      backgroundColor: colors.error,
      borderRadius: 4,
    },
    eligibilityProgressLabel: {
      fontFamily: font('body', 'medium'),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    eligibilityBannerClose: {
      position: 'absolute',
      top: theme.spacing.base,
      right: theme.spacing.base,
      padding: theme.spacing.xs,
    },
    bottomPadding: {
      height: 40,
    },
  });
