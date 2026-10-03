import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { typography } from '@/constants/typography';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';
import { AmountInput } from '@/components/forms/AmountInput';
import { PurposeSelector } from '@/components/forms/PurposeSelector';
import { TermSlider } from '@/components/forms/TermSlider';
import { LoanCalculator } from '@/components/forms/LoanCalculator';
import { SignaturePad } from '@/components/forms/SignaturePad';
import { Input } from '@/components/common/Input';
import { SuccessModal } from '@/components/modals/SuccessModal/index';
import { InfoModal } from '@/components/modals/InfoModal';
import { loanConfig, calculateLoan, buildSchedulePreview } from '@/constants/loans';
import { loansApi, LoanApplicationRejection } from '@/lib/api/loans.api';
import type { LoanGuarantorInput } from '@/lib/api/loans.api';
import { members } from '@/lib/api/members.api';
import type { LoanType, InsufficientContributionsError, ActiveLoanExistsError } from '@/lib/types/loans';
import { parseNairaInput, toApiAmount, formatNaira } from '@/lib/utils/currency';

const MIN_PURPOSE_LENGTH = 10;

/**
 * 1 amount & purpose · 2 applicant (Part A) · 3 terms & schedule (Part A item 8)
 * · 4 guarantors (Part B) · 5 review & sign (Part A item 9)
 */
type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

interface StepMeta {
  step: Step;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const STEPS_META: StepMeta[] = [
  {
    step: 1,
    title: 'How much, and what for?',
    shortTitle: 'Details',
    subtitle: 'Specify your loan amount, purpose, and cooperative loan category.',
    icon: 'payments',
  },
  {
    step: 2,
    title: 'Applicant Details',
    shortTitle: 'Profile',
    subtitle: 'Verify the address and bank account to be recorded on your loan bond.',
    icon: 'person',
  },
  {
    step: 3,
    title: 'Terms & Repayment',
    shortTitle: 'Terms',
    subtitle: 'Choose your loan tenure and review the monthly installment plan.',
    icon: 'calendar-today',
  },
  {
    step: 4,
    title: 'Your Three Guarantors',
    shortTitle: 'Guarantors',
    subtitle: 'Provide contact details and digital signatures for three guarantors.',
    icon: 'people',
  },
  {
    step: 5,
    title: 'Review & Sign Bond',
    shortTitle: 'Sign',
    subtitle: 'Review all application terms and sign your official borrower bond deed.',
    icon: 'draw',
  },
];

const emptyGuarantor = (): LoanGuarantorInput => ({
  full_name: '',
  bank_name: '',
  bank_account: '',
  phone: '',
  signature: '',
});

export default function ApplyForLoanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);

  const [step, setStep] = useState<Step>(1);

  // Step 1 — amount & purpose
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<LoanType | null>(null);
  const [purpose, setPurpose] = useState('');

  // Step 2 — Part A applicant details. Prefilled from the profile but editable,
  // because the server stores them as a snapshot on the bond.
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3 — terms
  const [term, setTerm] = useState(loanConfig.maxTerm);
  const [interestRate, setInterestRate] = useState(loanConfig.defaultInterestRate);

  // Step 4 — Part B
  const [guarantors, setGuarantors] = useState<LoanGuarantorInput[]>([
    emptyGuarantor(),
    emptyGuarantor(),
    emptyGuarantor(),
  ]);

  // Step 5 — Part A item 9
  const [borrowerSignature, setBorrowerSignature] = useState('');

  // Lock ScrollView while signing so the signature boxes stay firmly in place
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBeginSigning = useCallback(() => {
    setScrollEnabled(false);
    try {
      scrollViewRef.current?.setNativeProps?.({ scrollEnabled: false });
    } catch {
      // Ignore if setNativeProps is unavailable in modern Fabric arch
    }
  }, []);

  const handleEndSigning = useCallback(() => {
    setScrollEnabled(true);
    try {
      scrollViewRef.current?.setNativeProps?.({ scrollEnabled: true });
    } catch {
      // Ignore if setNativeProps is unavailable in modern Fabric arch
    }
  }, []);

  useEffect(() => {
    setScrollEnabled(true);
  }, [step]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [eligibilityError, setEligibilityError] =
    useState<InsufficientContributionsError | null>(null);
  const [activeLoanError, setActiveLoanError] =
    useState<ActiveLoanExistsError | null>(null);

  // Seed Part A from the member's profile so they confirm rather than retype.
  useEffect(() => {
    let cancelled = false;
    members
      .getProfile()
      .then((p) => {
        if (cancelled) return;
        setAddress((v) => v || p.address || '');
        setBankName((v) => v || p.bank_name || '');
        setBankAccount((v) => v || p.bank_account || '');
        setPhone((v) => v || p.phone || '');
      })
      .catch(() => {
        // Prefill is a convenience; the fields stay editable either way.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loanDetails = useMemo(() => {
    const numericAmount = parseNairaInput(amount) || 0;
    return calculateLoan(numericAmount, term, interestRate);
  }, [amount, term, interestRate]);

  const schedule = useMemo(() => {
    const numericAmount = parseNairaInput(amount) || 0;
    if (numericAmount <= 0) return [];
    return buildSchedulePreview(numericAmount, term, interestRate);
  }, [amount, term, interestRate]);

  const setGuarantor = useCallback(
    (index: number, patch: Partial<LoanGuarantorInput>) => {
      setGuarantors((prev) =>
        prev.map((g, i) => (i === index ? { ...g, ...patch } : g)),
      );
      setErrors((e) => ({ ...e, [`guarantor_${index}`]: undefined }));
    },
    [],
  );

  const validateStep = useCallback(
    (target: Step): boolean => {
      const next: Record<string, string | undefined> = {};
      const numericAmount = parseNairaInput(amount) || 0;

      if (target === 1) {
        if (!amount || numericAmount < loanConfig.minAmount) {
          next.amount = `Minimum loan amount is ₦${loanConfig.minAmount.toLocaleString()}`;
        } else if (numericAmount > loanConfig.maxAmount) {
          next.amount = `Maximum loan amount is ₦${loanConfig.maxAmount.toLocaleString()}`;
        }
        if (!type) next.type = 'Please select a loan type';
        if (purpose.trim().length < MIN_PURPOSE_LENGTH) {
          next.purpose = `Please describe your purpose (at least ${MIN_PURPOSE_LENGTH} characters)`;
        }
      }

      if (target === 2) {
        if (address.trim().length < 5) next.address = 'Your address is required';
        if (bankName.trim().length < 2) next.bank_name = 'Your bank is required';
        if (bankAccount.trim().length < 10) {
          next.bank_account = 'Enter a valid 10-digit account number';
        }
        if (phone.trim().length < 7) next.phone = 'A phone number is required';
      }

      if (target === 3 && loanDetails.installments < 1) {
        next.term = `A ${term}-month term is all grace and leaves no installments`;
      }

      if (target === 4) {
        guarantors.forEach((g, i) => {
          if (
            g.full_name.trim().length < 2 ||
            g.bank_name.trim().length < 2 ||
            g.bank_account.trim().length < 10 ||
            g.phone.trim().length < 7
          ) {
            next[`guarantor_${i}`] = 'All fields are required for this guarantor';
          } else if (!g.signature) {
            next[`guarantor_${i}`] = 'This guarantor still needs to sign';
          }
        });
      }

      if (target === 5 && !borrowerSignature) {
        next.borrower_signature = 'Please sign to submit your application';
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [
      amount, type, purpose, address, bankName, bankAccount, phone,
      guarantors, borrowerSignature, loanDetails.installments, term,
    ],
  );

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) {
      setErrors({});
      setStep((s) => (s - 1) as Step);
      return;
    }
    router.back();
  };

  const handleSubmit = async () => {
    if (!validateStep(5) || !type) return;

    setIsSubmitting(true);
    try {
      // Whole Naira, ≤ 2dp, range-checked — the server validates with strict
      // t.Number and rejects strings / out-of-range values (currency-contract.md).
      await loansApi.apply({
        amount: toApiAmount(parseNairaInput(amount), loanConfig.minAmount),
        purpose: purpose.trim(),
        type,
        tenure_months: term,
        applicant_address: address.trim(),
        applicant_bank_name: bankName.trim(),
        applicant_bank_account: bankAccount.trim(),
        applicant_phone: phone.trim(),
        borrower_signature: borrowerSignature,
        guarantors: guarantors.map((g) => ({
          full_name: g.full_name.trim(),
          bank_name: g.bank_name.trim(),
          bank_account: g.bank_account.trim(),
          phone: g.phone.trim(),
          signature: g.signature,
        })),
      });
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

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.replace('/(tabs)/loans');
  };

  const currentStepMeta = STEPS_META[step - 1];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <ScreenHeader title="Loan Application" onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Stepper Header */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepTrack}>
              {STEPS_META.map((item, idx) => {
                const isCompleted = item.step < step;
                const isCurrent = item.step === step;

                return (
                  <React.Fragment key={item.step}>
                    <View style={styles.stepNodeContainer}>
                      <View
                        style={[
                          styles.stepNode,
                          isCompleted && styles.stepNodeCompleted,
                          isCurrent && styles.stepNodeCurrent,
                        ]}
                      >
                        {isCompleted ? (
                          <MaterialIcons name="check" size={14} color={colors.onPrimary} />
                        ) : (
                          <Text
                            style={[
                              styles.stepNodeText,
                              isCurrent && styles.stepNodeTextCurrent,
                            ]}
                          >
                            {item.step}
                          </Text>
                        )}
                      </View>
                    </View>

                    {idx < STEPS_META.length - 1 && (
                      <View
                        style={[
                          styles.stepTrackLine,
                          item.step < step && styles.stepTrackLineCompleted,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            <View style={styles.stepHeaderCard}>
              <View style={styles.stepHeaderBadgeRow}>
                <View style={styles.stepBadge}>
                  <MaterialIcons name={currentStepMeta.icon} size={14} color={colors.primary} />
                  <Text style={styles.stepBadgeText}>
                    STEP {step} OF {TOTAL_STEPS} · {currentStepMeta.shortTitle.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.stepPercentText}>
                  {Math.round((step / TOTAL_STEPS) * 100)}%
                </Text>
              </View>

              <Text style={styles.stepTitle}>{currentStepMeta.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStepMeta.subtitle}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {step === 1 && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.stepContent}>
                <View style={styles.infoBanner}>
                  <View style={styles.infoBannerIconWrap}>
                    <MaterialIcons name="info-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoBannerTextWrap}>
                    <Text style={styles.infoBannerTitle}>Cooperative Loan Guidelines</Text>
                    <Text style={styles.infoBannerText}>
                      Loan requests are vetted by the Credit Committee based on your accumulated savings,
                      membership standing, and repayment capacity.
                    </Text>
                  </View>
                </View>

                <View style={styles.formSectionCard}>
                  <AmountInput value={amount} onChangeText={setAmount} error={errors.amount} />
                </View>

                <View style={styles.formSectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Select Loan Category</Text>
                  <PurposeSelector
                    selectedType={type}
                    onSelectType={(next) => {
                      setType(next);
                      setErrors((e) => ({ ...e, type: undefined }));
                    }}
                  />
                  {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                </View>

                <View style={styles.formSectionCard}>
                  <Input
                    label="Specific Purpose"
                    placeholder="Briefly describe what this loan will be used for…"
                    value={purpose}
                    onChangeText={(t) => {
                      setPurpose(t);
                      setErrors((e) => ({ ...e, purpose: undefined }));
                    }}
                    multiline
                    numberOfLines={3}
                    error={errors.purpose}
                    helper="Provide clear details to help the Credit Committee evaluate your application."
                  />
                </View>
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.stepContent}>
                <View style={styles.infoBanner}>
                  <View style={styles.infoBannerIconWrap}>
                    <MaterialIcons name="verified-user" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoBannerTextWrap}>
                    <Text style={styles.infoBannerTitle}>Pre-filled from Profile</Text>
                    <Text style={styles.infoBannerText}>
                      These details are recorded on your legal loan bond exactly as entered.
                      Verify or edit them before proceeding.
                    </Text>
                  </View>
                </View>

                <View style={styles.formSectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons name="location-on" size={18} color={colors.primary} />
                    <Text style={styles.sectionHeaderTitle}>Residential & Business Address</Text>
                  </View>
                  <Input
                    label="Business / Home Address"
                    placeholder="Your address"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={2}
                    error={errors.address}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+234 123 456 7890"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />
                </View>

                <View style={styles.formSectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons name="account-balance" size={18} color={colors.primary} />
                    <Text style={styles.sectionHeaderTitle}>Disbursement Bank Account</Text>
                  </View>
                  <Input
                    label="Bank Used"
                    placeholder="e.g. First Bank of Nigeria"
                    value={bankName}
                    onChangeText={setBankName}
                    error={errors.bank_name}
                  />
                  <Input
                    label="Account Number"
                    placeholder="1234567890"
                    value={bankAccount}
                    onChangeText={setBankAccount}
                    keyboardType="numeric"
                    error={errors.bank_account}
                  />
                </View>
              </Animated.View>
            )}

            {step === 3 && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.stepContent}>
                <View style={styles.formSectionCard}>
                  <TermSlider value={term} onValueChange={setTerm} />
                  {errors.term && <Text style={styles.errorText}>{errors.term}</Text>}
                </View>

                <LoanCalculator
                  monthlyPayment={loanDetails.monthlyPayment}
                  totalRepayment={loanDetails.totalRepayment}
                  totalInterest={loanDetails.totalInterest}
                  interestRate={interestRate}
                  onInterestRateChange={setInterestRate}
                />

                <View style={styles.scheduleCard}>
                  <View style={styles.scheduleHeaderRow}>
                    <View style={styles.scheduleHeaderTitleWrap}>
                      <MaterialIcons name="event-note" size={20} color={colors.primary} />
                      <Text style={styles.scheduleTitle}>Repayment Schedule</Text>
                    </View>
                    <View style={styles.scheduleBadge}>
                      <Text style={styles.scheduleBadgeText}>
                        {loanDetails.installments} Payments
                      </Text>
                    </View>
                  </View>

                  <View style={styles.graceCallout}>
                    <MaterialIcons name="hourglass-top" size={18} color={colors.primary} />
                    <View style={styles.graceCalloutTextWrap}>
                      <Text style={styles.graceCalloutTitle}>
                        {loanDetails.graceMonths} Month Grace Period Included
                      </Text>
                      <Text style={styles.graceCalloutDesc}>
                        No payment is due during the first month following payout. Repayments commence
                        in Month 2.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduleList}>
                    {schedule.map((row, idx) => (
                      <View
                        key={row.installment_no}
                        style={[
                          styles.scheduleRow,
                          idx === schedule.length - 1 && styles.scheduleRowLast,
                        ]}
                      >
                        <View style={styles.scheduleRowLeft}>
                          <View style={styles.installmentIndexBadge}>
                            <Text style={styles.installmentIndexText}>#{row.installment_no}</Text>
                          </View>
                          <Text style={styles.scheduleMonth}>
                            {row.due_on.toLocaleDateString(undefined, {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.scheduleAmount}>
                          {formatNaira(row.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.scheduleTotalRow}>
                    <Text style={styles.scheduleTotalLabel}>Total Amount Repayable</Text>
                    <Text style={styles.scheduleTotalValue}>
                      {formatNaira(loanDetails.totalRepayment)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {step === 4 && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.stepContent}>
                {/* Info Callout Banner */}
                <View style={styles.infoBanner}>
                  <View style={styles.infoBannerIconWrap}>
                    <MaterialIcons name="security" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoBannerTextWrap}>
                    <Text style={styles.infoBannerTitle}>Cooperative Policy (Part B)</Text>
                    <Text style={styles.infoBannerText}>
                      The cooperative requires three guarantors. Each one must provide their details
                      and sign directly on this device.
                    </Text>
                  </View>
                </View>

                {guarantors.map((g, i) => {
                  const isSigned = Boolean(g.signature);
                  return (
                    <View key={i} style={styles.guarantorCard}>
                      {/* Card Header */}
                      <View style={styles.guarantorCardHeader}>
                        <View style={styles.guarantorBadge}>
                          <Text style={styles.guarantorBadgeText}>{i + 1}</Text>
                        </View>
                        <View style={styles.guarantorHeaderTitles}>
                          <Text style={styles.guarantorTitle}>Guarantor {i + 1}</Text>
                          <Text style={styles.guarantorSubtitle}>
                            {g.full_name.trim() || 'Details & Signature required'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            isSigned ? styles.statusPillSigned : styles.statusPillPending,
                          ]}
                        >
                          <MaterialIcons
                            name={isSigned ? 'check-circle' : 'edit'}
                            size={14}
                            color={isSigned ? colors.success : colors.onSurfaceVariant}
                          />
                          <Text
                            style={[
                              styles.statusPillText,
                              isSigned ? styles.statusPillTextSigned : styles.statusPillTextPending,
                            ]}
                          >
                            {isSigned ? 'Signed' : 'Needs Sign'}
                          </Text>
                        </View>
                      </View>

                      {/* Inputs Section */}
                      <View style={styles.guarantorInputsSection}>
                        <Input
                          label="Full Name"
                          placeholder="Their full name"
                          value={g.full_name}
                          onChangeText={(v) => setGuarantor(i, { full_name: v })}
                          autoCapitalize="words"
                        />
                        <Input
                          label="Name of Bank"
                          placeholder="e.g. Zenith Bank"
                          value={g.bank_name}
                          onChangeText={(v) => setGuarantor(i, { bank_name: v })}
                        />
                        <Input
                          label="Account Number"
                          placeholder="1234567890"
                          value={g.bank_account}
                          onChangeText={(v) => setGuarantor(i, { bank_account: v })}
                          keyboardType="numeric"
                        />
                        <Input
                          label="Phone Number"
                          placeholder="+234 123 456 7890"
                          value={g.phone}
                          onChangeText={(v) => setGuarantor(i, { phone: v })}
                          keyboardType="phone-pad"
                        />
                      </View>

                      {/* Signature Sub-section */}
                      <View style={styles.signatureSection}>
                        <View style={styles.signatureSectionHeader}>
                          <MaterialIcons name="draw" size={16} color={colors.primary} />
                          <Text style={styles.signatureSectionTitle}>
                            Guarantor {i + 1} Signature
                          </Text>
                        </View>
                        <Text style={styles.signatureSectionHelp}>
                          Guarantor {i + 1} must sign inside the box below to authorize this bond.
                        </Text>
                        <SignaturePad
                          label=""
                          value={g.signature || null}
                          onChange={(sig) => setGuarantor(i, { signature: sig ?? '' })}
                          onBegin={handleBeginSigning}
                          onEnd={handleEndSigning}
                        />
                      </View>

                      {errors[`guarantor_${i}`] && (
                        <View style={styles.errorBox}>
                          <MaterialIcons name="error-outline" size={16} color={colors.error} />
                          <Text style={styles.errorBoxText}>{errors[`guarantor_${i}`]}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </Animated.View>
            )}

            {step === 5 && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.stepContent}>
                {/* Hero Summary Card */}
                <View style={styles.reviewHeroCard}>
                  <Text style={styles.reviewHeroLabel}>Loan Principal Requested</Text>
                  <Text style={styles.reviewHeroAmount}>
                    {formatNaira(parseNairaInput(amount) || 0)}
                  </Text>
                  <View style={styles.reviewHeroPillsRow}>
                    <View style={styles.reviewHeroPill}>
                      <MaterialIcons name="timelapse" size={14} color={colors.onPrimary} />
                      <Text style={styles.reviewHeroPillText}>
                        {term} Months Tenure
                      </Text>
                    </View>
                    <View style={styles.reviewHeroPill}>
                      <MaterialIcons name="payments" size={14} color={colors.onPrimary} />
                      <Text style={styles.reviewHeroPillText}>
                        {formatNaira(loanDetails.monthlyPayment)} / mo
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Review Details Card */}
                <View style={styles.formSectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons name="list-alt" size={18} color={colors.primary} />
                    <Text style={styles.sectionHeaderTitle}>Application Summary</Text>
                  </View>
                  <ReviewRow styles={styles} label="Loan Purpose" value={purpose.trim()} />
                  <ReviewRow
                    styles={styles}
                    label="Repayment Plan"
                    value={`${loanDetails.installments} installments (${loanDetails.graceMonths} mo. grace)`}
                  />
                  <ReviewRow
                    styles={styles}
                    label="Total Interest"
                    value={formatNaira(loanDetails.totalInterest)}
                  />
                  <ReviewRow
                    styles={styles}
                    label="Total Repayable"
                    value={formatNaira(loanDetails.totalRepayment)}
                  />
                  <ReviewRow
                    styles={styles}
                    label="Disbursement Bank"
                    value={`${bankName.trim()} · ${bankAccount.trim()}`}
                  />
                  <ReviewRow styles={styles} label="Address" value={address.trim()} />
                </View>

                {/* Guarantors Status in Review */}
                <View style={styles.formSectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons name="people-alt" size={18} color={colors.primary} />
                    <Text style={styles.sectionHeaderTitle}>Guarantors Confirmed (3/3)</Text>
                  </View>
                  {guarantors.map((g, idx) => (
                    <View key={idx} style={styles.reviewGuarantorRow}>
                      <View style={styles.guarantorBadgeSmall}>
                        <Text style={styles.guarantorBadgeSmallText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.reviewGuarantorInfo}>
                        <Text style={styles.reviewGuarantorName}>
                          {g.full_name.trim() || `Guarantor ${idx + 1}`}
                        </Text>
                        <Text style={styles.reviewGuarantorMeta}>
                          {g.bank_name.trim()} · {g.phone.trim()}
                        </Text>
                      </View>
                      <View style={styles.statusPillSmall}>
                        <MaterialIcons name="check-circle" size={14} color={colors.success} />
                        <Text style={styles.statusPillSmallText}>Signed</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Bond Undertaking Box */}
                <View style={styles.bondAgreementBox}>
                  <MaterialIcons name="gavel" size={22} color={colors.primary} />
                  <View style={styles.bondAgreementTextWrap}>
                    <Text style={styles.bondAgreementTitle}>Legal Loan Bond & Undertaking</Text>
                    <Text style={styles.bondAgreementText}>
                      By signing below, you agree to use this loan solely for the stated purpose and to repay
                      it in {loanDetails.installments} equal monthly installments of{' '}
                      {formatNaira(loanDetails.monthlyPayment)}. You affirm all details are true and understand
                      this deed is legally binding.
                    </Text>
                  </View>
                </View>

                {/* Borrower Signature Card */}
                <View style={styles.formSectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons name="draw" size={18} color={colors.primary} />
                    <Text style={styles.sectionHeaderTitle}>Borrower Signature</Text>
                  </View>
                  <Text style={styles.stepHelp}>
                    Sign inside the pad below to authorize your loan application and bond deed.
                  </Text>
                  <SignaturePad
                    label=""
                    value={borrowerSignature || null}
                    onChange={(sig) => {
                      setBorrowerSignature(sig ?? '');
                      setErrors((e) => ({ ...e, borrower_signature: undefined }));
                    }}
                    error={errors.borrower_signature}
                    onBegin={handleBeginSigning}
                    onEnd={handleEndSigning}
                  />
                </View>
              </Animated.View>
            )}

            {/* Navigation */}
            <View style={styles.navRow}>
              {step > 1 && (
                <View style={styles.navButton}>
                  <Button
                    title="Back"
                    onPress={handleBack}
                    variant="tonal"
                    size="lg"
                    icon="arrow-back"
                    iconPosition="left"
                    fullWidth
                  />
                </View>
              )}
              <View style={styles.navButton}>
                {step < TOTAL_STEPS ? (
                  <Button
                    title="Continue"
                    onPress={handleNext}
                    variant="primary"
                    size="lg"
                    icon="arrow-forward"
                    iconPosition="right"
                    fullWidth
                  />
                ) : (
                  <Button
                    title={isSubmitting ? 'Submitting…' : 'Submit Application'}
                    onPress={handleSubmit}
                    variant="primary"
                    size="lg"
                    icon="send"
                    iconPosition="right"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fullWidth
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="Loan Request Submitted"
        message="Your application, guarantors and signature have been received. The Secretary and President will review it."
      />

      <InfoModal
        visible={submitError !== null}
        onClose={() => setSubmitError(null)}
        icon="info"
        iconColor={colors.error}
        title="Application Failed"
        message={submitError ?? ''}
        primaryButtonText="Close"
        onPrimaryPress={() => setSubmitError(null)}
      />

      <InfoModal
        visible={eligibilityError !== null}
        onClose={() => setEligibilityError(null)}
        icon="info"
        iconColor={colors.warning}
        title="Not Eligible Yet"
        message={
          eligibilityError
            ? `You need ${eligibilityError.eligibility.required_count} verified contributions to apply. You have ${eligibilityError.eligibility.verified_count} — ${eligibilityError.eligibility.short_by} to go.`
            : ''
        }
        primaryButtonText="Close"
        onPrimaryPress={() => setEligibilityError(null)}
      />

      <InfoModal
        visible={activeLoanError !== null}
        onClose={() => setActiveLoanError(null)}
        icon="info"
        iconColor={colors.warning}
        title="You Already Have a Loan"
        message="You can only hold one active loan at a time. Please finish repaying your current loan before applying again."
        primaryButtonText="Close"
        onPrimaryPress={() => setActiveLoanError(null)}
      />
    </SafeAreaView>
  );
}

/** One label/value line on the review step. */
function ReviewRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
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
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['2xl'],
    },
    bottomPadding: {
      height: 32,
    },

    // --- Stepper Header ---
    stepperContainer: {
      marginBottom: theme.spacing.lg,
    },
    stepTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingHorizontal: 4,
    },
    stepNodeContainer: {
      alignItems: 'center',
    },
    stepNode: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
    },
    stepNodeCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepNodeCurrent: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    stepNodeText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    stepNodeTextCurrent: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    stepTrackLine: {
      flex: 1,
      height: 3,
      backgroundColor: colors.surfaceContainerHighest,
      marginHorizontal: 4,
      borderRadius: 2,
    },
    stepTrackLineCompleted: {
      backgroundColor: colors.primary,
    },
    stepHeaderCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    stepHeaderBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    stepBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primaryFixed,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    stepBadgeText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 1,
      color: colors.onPrimaryFixedVariant,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    stepPercentText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      fontWeight: '600',
    },
    stepTitle: {
      ...typography.styles.cardTitle,
      fontSize: typography.size.lg,
      color: colors.onSurface,
      marginBottom: 4,
    },
    stepSubtitle: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },

    // --- Info Banner ---
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    infoBannerIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${colors.primary}12`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoBannerTextWrap: {
      flex: 1,
    },
    infoBannerTitle: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '700',
      marginBottom: 2,
    },
    infoBannerText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      lineHeight: 16,
    },

    // --- Form Container & Cards ---
    formContainer: {
      gap: theme.spacing.lg,
    },
    stepContent: {
      gap: theme.spacing.base,
    },
    formSectionCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: theme.spacing.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: 2,
    },
    sectionHeaderTitle: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onSurface,
      fontWeight: '700',
    },
    stepHelp: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
    errorText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.error,
      marginTop: theme.spacing.xs,
    },

    // --- Step 3 Schedule Card ---
    scheduleCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: theme.spacing.base,
    },
    scheduleHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scheduleHeaderTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    scheduleTitle: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onSurface,
      fontWeight: '700',
    },
    scheduleBadge: {
      backgroundColor: colors.primaryFixed,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    scheduleBadgeText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 1,
      color: colors.onPrimaryFixedVariant,
      fontWeight: '700',
    },
    graceCallout: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      backgroundColor: colors.surfaceContainerLow,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    graceCalloutTextWrap: {
      flex: 1,
    },
    graceCalloutTitle: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '700',
      marginBottom: 2,
    },
    graceCalloutDesc: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      lineHeight: 16,
    },
    scheduleList: {
      borderRadius: theme.borderRadius.lg,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: 'hidden',
    },
    scheduleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    scheduleRowLast: {
      borderBottomWidth: 0,
    },
    scheduleRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    installmentIndexBadge: {
      width: 26,
      height: 20,
      borderRadius: 6,
      backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    installmentIndexText: {
      ...typography.styles.label,
      fontSize: 10,
      color: colors.onSurfaceVariant,
      fontWeight: '700',
    },
    scheduleMonth: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '500',
    },
    scheduleAmount: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '700',
    },
    scheduleTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    scheduleTotalLabel: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      fontWeight: '600',
    },
    scheduleTotalValue: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.primary,
      fontWeight: '800',
    },

    // --- Step 4 Guarantor Cards ---
    guarantorCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: theme.spacing.base,
    },
    guarantorCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    guarantorBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guarantorBadgeText: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onPrimary,
      fontWeight: '700',
    },
    guarantorHeaderTitles: {
      flex: 1,
    },
    guarantorTitle: {
      ...typography.styles.label,
      fontSize: typography.size.sm,
      color: colors.onSurface,
      fontWeight: '700',
    },
    guarantorSubtitle: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    statusPillSigned: {
      backgroundColor: colors.successContainer,
    },
    statusPillPending: {
      backgroundColor: colors.surfaceContainerHigh,
    },
    statusPillText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 1,
      fontWeight: '600',
    },
    statusPillTextSigned: {
      color: colors.onSuccessContainer,
    },
    statusPillTextPending: {
      color: colors.onSurfaceVariant,
    },
    guarantorInputsSection: {
      gap: theme.spacing.sm,
    },
    signatureSection: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: theme.spacing.xs,
    },
    signatureSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    signatureSectionTitle: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '700',
    },
    signatureSectionHelp: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.errorContainer,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    errorBoxText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onErrorContainer,
      flex: 1,
    },

    // --- Step 5 Review & Sign ---
    reviewHeroCard: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    reviewHeroLabel: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}90`,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    reviewHeroAmount: {
      ...typography.styles.displayLarge,
      fontSize: typography.size['2xl'],
      color: colors.onPrimary,
      fontWeight: '800',
    },
    reviewHeroPillsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    reviewHeroPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    reviewHeroPillText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 1,
      color: colors.onPrimary,
      fontWeight: '600',
    },
    reviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    reviewLabel: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      flex: 1,
    },
    reviewValue: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      flex: 1.4,
      textAlign: 'right',
      fontWeight: '600',
    },
    reviewGuarantorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    guarantorBadgeSmall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guarantorBadgeSmallText: {
      ...typography.styles.label,
      fontSize: 10,
      color: colors.onPrimary,
      fontWeight: '700',
    },
    reviewGuarantorInfo: {
      flex: 1,
    },
    reviewGuarantorName: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '600',
    },
    reviewGuarantorMeta: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
    },
    statusPillSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.successContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    statusPillSmallText: {
      ...typography.styles.label,
      fontSize: 10,
      color: colors.onSuccessContainer,
      fontWeight: '700',
    },
    bondAgreementBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    bondAgreementTextWrap: {
      flex: 1,
    },
    bondAgreementTitle: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.onSurface,
      fontWeight: '700',
      marginBottom: 4,
    },
    bondAgreementText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs - 1,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },

    // --- Navigation Buttons ---
    navRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    navButton: {
      flex: 1,
      minWidth: 0,
    },
  });
