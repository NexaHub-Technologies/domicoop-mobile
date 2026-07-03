import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { font } from "@/constants/theme";
import { typography } from '@/constants/typography';
import { AmountInput } from '@/components/forms/AmountInput';
import { PurposeSelector } from '@/components/forms/PurposeSelector';
import { TermSlider } from '@/components/forms/TermSlider';
import { LoanCalculator } from '@/components/forms/LoanCalculator';
import { SuccessModal } from '@/components/modals/SuccessModal/index';
import { loanConfig, calculateLoan } from '@/constants/loans';
import type { LoanPurpose } from '@/lib/types/loans';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ApplyForLoanScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState<LoanPurpose | null>(null);
  const [term, setTerm] = useState(12);
  const [interestRate, setInterestRate] = useState(loanConfig.defaultInterestRate);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; purpose?: string }>({});

  // Calculate loan details
  const loanDetails = useMemo(() => {
    const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    return calculateLoan(numericAmount, term, interestRate);
  }, [amount, term, interestRate]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { amount?: string; purpose?: string } = {};
    const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;

    if (!amount || numericAmount < loanConfig.minAmount) {
      newErrors.amount = `Minimum loan amount is ₦${loanConfig.minAmount.toLocaleString()}`;
    } else if (numericAmount > loanConfig.maxAmount) {
      newErrors.amount = `Maximum loan amount is ₦${loanConfig.maxAmount.toLocaleString()}`;
    }

    if (!purpose) {
      newErrors.purpose = 'Please select a loan purpose';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, purpose]);

  // Handle submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.replace('/(tabs)/loans');
  };

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Loan Application</Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <MaterialIcons name="account-balance" size={24} color={colors.primary} />
          </View>
          <Text style={styles.heroSubtitle}>DOMICOP Cooperative</Text>
          <Text style={styles.heroTitle}>Apply for a Loan</Text>
          <Text style={styles.heroDescription}>
            Complete the form below to submit your request. Most decisions are made within 24 hours.
          </Text>
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

          {/* Purpose Selector */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <PurposeSelector
              selectedPurpose={purpose}
              onSelectPurpose={setPurpose}
            />
            {errors.purpose && (
              <Text style={styles.errorText}>{errors.purpose}</Text>
            )}
          </Animated.View>

          {/* Term Slider */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <TermSlider
              value={term}
              onValueChange={setTerm}
            />
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
                  <Text style={styles.submitButtonText}>Apply for Loan</Text>
                  <MaterialIcons name="send" size={20} color={colors.onPrimary} />
                </>
              )}
            </AnimatedTouchable>
            
            <Text style={styles.termsText}>
              By clicking apply, you agree to DOMICOP&apos;s Terms of Service and Privacy Policy.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="Loan Request Submitted"
        message="Most decisions are made within 24 hours. We'll notify you once your application is reviewed."
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
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
    fontFamily: font("display", "bold"),
    fontSize: typography.size.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
  },
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing['2xl'],
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontFamily: font("body", "semibold"),
    fontSize: typography.size.xs,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  heroTitle: {
    fontFamily: font("display", "extrabold"),
    fontSize: typography.size['2xl'],
    color: colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  heroDescription: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.base,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    shadowColor: colors.ambientShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  termsText: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.xs - 2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: theme.spacing.base,
    paddingHorizontal: theme.spacing['2xl'],
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
