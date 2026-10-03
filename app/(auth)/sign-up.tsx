import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { BackButton } from "@/components/auth/BackButton";
import { FormCard } from "@/components/auth/FormCard";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { DropdownSelect } from "@/components/forms/DropdownSelect";
import { ProfileImagePicker } from "@/components/forms/ProfileImagePicker";
import { SignaturePad } from "@/components/forms/SignaturePad";
import { InfoModal } from "@/components/modals/InfoModal";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import type { SignUpData, SignUpErrors, SignUpStep } from "@/types";
import { auth } from "@/lib/api/auth.api";
import { registration } from "@/lib/api/registration.api";
import { useRegistrationWindow } from "@/hooks/useRegistrationWindow";
import { usePaystackPayment } from "@/hooks/usePaystackPayment";
import { formatNaira } from "@/lib/utils/currency";
import { ApiError } from "@/lib/http";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

// Nigerian Banks with their codes
const NIGERIAN_BANKS = [
  { value: "044", label: "Access Bank (044)" },
  { value: "023", label: "Citibank Nigeria (023)" },
  { value: "050", label: "Ecobank Nigeria (050)" },
  { value: "070", label: "Fidelity Bank (070)" },
  { value: "011", label: "First Bank of Nigeria (011)" },
  { value: "214", label: "First City Monument Bank (214)" },
  { value: "058", label: "Guaranty Trust Bank (058)" },
  { value: "030", label: "Heritage Bank (030)" },
  { value: "301", label: "Jaiz Bank (301)" },
  { value: "082", label: "Keystone Bank (082)" },
  { value: "076", label: "Polaris Bank (076)" },
  { value: "039", label: "Stanbic IBTC Bank (039)" },
  { value: "232", label: "Sterling Bank (232)" },
  { value: "032", label: "Union Bank of Nigeria (032)" },
  { value: "033", label: "United Bank for Africa (033)" },
  { value: "215", label: "Unity Bank (215)" },
  { value: "035", label: "Wema Bank (035)" },
  { value: "057", label: "Zenith Bank (057)" },
  { value: "559", label: "Coronation Merchant Bank (559)" },
  { value: "502", label: "Providus Bank (502)" },
  { value: "526", label: "Parallex Bank (526)" },
  { value: "503", label: "SunTrust Bank (503)" },
  { value: "221", label: "Stanbic IBTC Bank (221)" },
  { value: "101", label: "ProvidusBank (101)" },
];

const SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const TOTAL_STEPS = 6;

/**
 * Fallback fee figures, used only while the window is still loading so the
 * review step never flashes ₦0. The window the server returns is authoritative
 * — it is also what the payment is verified against, so these must never be
 * used to build the actual charge.
 */
const FALLBACK_REGISTRATION_FEE = 20000;
const FALLBACK_SOCIAL_FEE = 1000;

/**
 * One label/value line on the review step. Long values wrap rather than
 * truncate — an address has to be checkable at a glance.
 *
 * Module level, not a closure inside the screen: a component redefined each
 * render is a new type each render, so React would unmount and remount every
 * row on every keystroke.
 */
function SummaryRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value || "—"}</Text>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const { isOpen, window: win, isLoading: windowLoading } = useRegistrationWindow();
  const { initiateRegistrationPayment } = usePaystackPayment();

  // Form state
  const [currentStep, setCurrentStep] = useState<SignUpStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Lock ScrollView while signing so the signature box stays firmly in place
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
  }, [currentStep]);

  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    full_name: "",
    sex: "",
    date_of_birth: "",
    phone: "",
    whatsapp_number: "",
    marital_status: "",
    address: "",
    id_card_number: "",
    next_of_kin: "",
    place_of_work: "",
    type_of_business: "",
    bank_name: "",
    bank_account: "",
    bank_code: "",
    referred_by: "",
    monthly_subscription: "",
    avatar_url: "",
    signature: "",
  });

  const registrationFee = win?.registration_fee ?? FALLBACK_REGISTRATION_FEE;
  const socialFee = win?.social_fee ?? FALLBACK_SOCIAL_FEE;
  const totalDue = win?.total_due ?? registrationFee + socialFee;
  const minSubscription = win?.min_monthly_subscription ?? 5000;
  const maxSubscription = win?.max_monthly_subscription ?? 50000;

  // The window can close while the form is being filled in. Bounce rather than
  // let someone reach a checkout the server will refuse.
  useEffect(() => {
    if (!windowLoading && !isOpen) {
      router.replace("/registration-closed");
    }
  }, [windowLoading, isOpen, router]);

  // Update form field
  const updateField = useCallback(
    (field: keyof SignUpData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: SignUpErrors = {};

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: SignUpErrors = {};

    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }
    if (!formData.sex) {
      newErrors.sex = "Please select an option";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth)) {
      newErrors.date_of_birth = "Use the format YYYY-MM-DD";
    } else if (Number.isNaN(Date.parse(formData.date_of_birth))) {
      newErrors.date_of_birth = "That is not a real date";
    }
    if (!formData.marital_status) {
      newErrors.marital_status = "Please select an option";
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Address is required";
    }
    if (!formData.id_card_number || formData.id_card_number.length < 4) {
      newErrors.id_card_number = "ID card number is required";
    }
    if (!formData.next_of_kin || formData.next_of_kin.length < 2) {
      newErrors.next_of_kin = "Next of kin is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: SignUpErrors = {};

    if (!formData.place_of_work || formData.place_of_work.length < 2) {
      newErrors.place_of_work = "Place of work is required";
    }
    if (!formData.type_of_business || formData.type_of_business.length < 2) {
      newErrors.type_of_business = "Type of business is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: SignUpErrors = {};

    if (!formData.bank_name || formData.bank_name.length < 2) {
      newErrors.bank_name = "Bank name is required";
    }
    if (!formData.bank_account || formData.bank_account.length < 10) {
      newErrors.bank_account = "Valid account number is required";
    }
    if (!formData.bank_code) {
      newErrors.bank_code = "Please select a bank";
    }

    const subscription = Number(formData.monthly_subscription);
    if (!formData.monthly_subscription || !Number.isFinite(subscription)) {
      newErrors.monthly_subscription = "Enter your monthly subscription";
    } else if (subscription < minSubscription || subscription > maxSubscription) {
      newErrors.monthly_subscription = `Must be between ${formatNaira(minSubscription)} and ${formatNaira(maxSubscription)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: SignUpErrors = {};

    // The paper form is not valid unsigned, so neither is this one. The photo
    // above it stays optional.
    if (!formData.signature) {
      newErrors.signature = "Please sign to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      case 6:
        isValid = true;
        break;
    }

    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as SignUpStep);
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SignUpStep);
    } else {
      router.back();
    }
  };

  /**
   * Turn the completed form into a membership.
   *
   * Payment comes first and the account second, deliberately: the server will
   * not create an account without a Paystack reference it can verify itself,
   * so there is no window in which an unpaid account exists. The cost of that
   * ordering is the reverse case — a charge that succeeds while the
   * application fails — which is why the error below surfaces the reference
   * rather than a generic failure. It is what support reconciles against.
   */
  const submitApplication = async (paymentReference: string) => {
    try {
      await registration.apply({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        sex: formData.sex,
        date_of_birth: formData.date_of_birth,
        phone: formData.phone,
        whatsapp_number: formData.whatsapp_number || undefined,
        marital_status: formData.marital_status,
        address: formData.address,
        id_card_number: formData.id_card_number,
        next_of_kin: formData.next_of_kin,
        place_of_work: formData.place_of_work,
        type_of_business: formData.type_of_business,
        bank_name: formData.bank_name,
        bank_account: formData.bank_account,
        bank_code: formData.bank_code,
        referred_by: formData.referred_by || undefined,
        monthly_subscription: Number(formData.monthly_subscription),
        avatar_url: formData.avatar_url || undefined,
        signature: formData.signature || undefined,
        payment_reference: paymentReference,
      });

      // Accounts are usable immediately (approval gates features, not sign-in),
      // so log the new member straight in to establish a session.
      await auth.login(formData.email, formData.password);
      setShowSuccessModal(true);
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setErrors({
        general: `${message}\n\nYour payment reference is ${paymentReference} — quote it if you need to contact support.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setErrors({ terms: "Please accept the membership terms to continue." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Free rejections first. Without this, an email that is already
      // registered would be discovered only after ₦21,000 had changed hands.
      await registration.precheck({
        email: formData.email,
        monthly_subscription: Number(formData.monthly_subscription),
      });
    } catch (error) {
      setIsLoading(false);
      setErrors({
        general:
          error instanceof ApiError || error instanceof Error
            ? error.message
            : "We could not verify your details. Please try again.",
      });
      return;
    }

    try {
      await initiateRegistrationPayment({
        // Whole Naira — react-native-paystack-webview multiplies by 100 itself
        // (see PaymentParams.amount and docs/currency-contract.md §3).
        amount: totalDue,
        email: formData.email,
        fullName: formData.full_name,
        onSuccess: (response) => {
          void submitApplication(response.reference);
        },
        onCancel: () => {
          setIsLoading(false);
          setErrors({ general: "Payment was cancelled. Your details are still here." });
        },
        onError: (error) => {
          setIsLoading(false);
          setErrors({
            general:
              error instanceof Error
                ? error.message
                : "We could not start the payment. Please try again.",
          });
        },
      });
    } catch (error) {
      setIsLoading(false);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "We could not start the payment. Please try again.",
      });
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/(tabs)");
  };

  // Handle image selection
  const handleImageSelect = (imageUri: string) => {
    updateField("avatar_url", imageUri);
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepDot,
              step === currentStep && styles.stepDotActive,
              step < currentStep && styles.stepDotCompleted,
            ]}
          >
            {step < currentStep ? (
              <MaterialIcons name="check" size={16} color={colors.onPrimary} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  step === currentStep && styles.stepNumberActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {step < TOTAL_STEPS && (
            <View
              style={[styles.stepLine, step < currentStep && styles.stepLineCompleted]}
            />
          )}
        </View>
      ))}
    </View>
  );

  // Render step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Create Account";
      case 2:
        return "Personal Information";
      case 3:
        return "Work & Business";
      case 4:
        return "Bank & Subscription";
      case 5:
        return "Photo & Signature";
      case 6:
        return "Review & Pay";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Enter your email and create a password";
      case 2:
        return "Tell us a bit about yourself";
      case 3:
        return "What you do, and who referred you";
      case 4:
        return "Bank details and your monthly subscription";
      case 5:
        return "Add a photo and sign your application";
      case 6:
        return "Check your details and pay the registration fee";
      default:
        return "";
    }
  };

  // Render Step 1: Account Information
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Input
        label="Email Address"
        placeholder="your@email.com"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <View>
        <Input
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChangeText={(text) => updateField("password", text)}
          secureTextEntry
          error={errors.password}
        />
        <PasswordStrength password={formData.password} />
      </View>
    </View>
  );

  // Render Step 2: Personal Information
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.full_name}
        onChangeText={(text) => updateField("full_name", text)}
        autoCapitalize="words"
        error={errors.full_name}
      />

      <View>
        <DropdownSelect
          label="Sex"
          value={formData.sex}
          options={SEX_OPTIONS}
          onSelect={(value) => updateField("sex", value)}
          placeholder="Select"
        />
        {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      </View>

      <Input
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={formData.date_of_birth}
        onChangeText={(text) => updateField("date_of_birth", text)}
        keyboardType="numeric"
        helper="For example 1990-04-27"
        error={errors.date_of_birth}
      />

      <View>
        <DropdownSelect
          label="Marital Status"
          value={formData.marital_status}
          options={MARITAL_STATUS_OPTIONS}
          onSelect={(value) => updateField("marital_status", value)}
          placeholder="Select"
        />
        {errors.marital_status && (
          <Text style={styles.errorText}>{errors.marital_status}</Text>
        )}
      </View>

      <Input
        label="Phone Number"
        placeholder="+234 123 456 7890"
        value={formData.phone}
        onChangeText={(text) => updateField("phone", text)}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <Input
        label="WhatsApp Number (Optional)"
        placeholder="+234 123 456 7890"
        value={formData.whatsapp_number}
        onChangeText={(text) => updateField("whatsapp_number", text)}
        keyboardType="phone-pad"
        helper="Leave blank if it is the same as your phone number"
      />

      <Input
        label="Address"
        placeholder="Enter your full address"
        value={formData.address}
        onChangeText={(text) => updateField("address", text)}
        multiline
        numberOfLines={3}
        style={styles.addressInput}
        error={errors.address}
      />

      <Input
        label="ID Card Number"
        placeholder="NIN, Voter's Card or Driver's Licence"
        value={formData.id_card_number}
        onChangeText={(text) => updateField("id_card_number", text)}
        autoCapitalize="characters"
        error={errors.id_card_number}
      />

      <Input
        label="Next of Kin"
        placeholder="Name - Phone Number"
        value={formData.next_of_kin}
        onChangeText={(text) => updateField("next_of_kin", text)}
        helper="Emergency contact information"
        error={errors.next_of_kin}
      />
    </View>
  );

  // Render Step 3: Work & Business
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Input
        label="Place of Work"
        placeholder="Employer or business name"
        value={formData.place_of_work}
        onChangeText={(text) => updateField("place_of_work", text)}
        autoCapitalize="words"
        error={errors.place_of_work}
      />

      <Input
        label="Type of Business"
        placeholder="Trading, teaching, tailoring…"
        value={formData.type_of_business}
        onChangeText={(text) => updateField("type_of_business", text)}
        autoCapitalize="sentences"
        error={errors.type_of_business}
      />

      <Input
        label="Who Referred You? (Optional)"
        placeholder="Name of the member who introduced you"
        value={formData.referred_by}
        onChangeText={(text) => updateField("referred_by", text)}
        autoCapitalize="words"
        helper="Leave blank if nobody referred you"
      />
    </View>
  );

  // Render Step 4: Bank Details & Subscription
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <DropdownSelect
        label="Select Bank"
        value={formData.bank_code}
        options={NIGERIAN_BANKS}
        onSelect={(value) => {
          updateField("bank_code", value);
          // Auto-fill bank name based on selection
          const selectedBank = NIGERIAN_BANKS.find((b) => b.value === value);
          if (selectedBank) {
            const bankName = selectedBank.label.split(" (")[0];
            updateField("bank_name", bankName);
          }
        }}
        placeholder="Choose your bank"
      />
      {errors.bank_code && <Text style={styles.errorText}>{errors.bank_code}</Text>}

      <Input
        label="Account Number"
        placeholder="1234567890"
        value={formData.bank_account}
        onChangeText={(text) => updateField("bank_account", text)}
        keyboardType="numeric"
        error={errors.bank_account}
      />

      <Input
        label="Monthly Subscription"
        placeholder={String(minSubscription)}
        value={formData.monthly_subscription}
        onChangeText={(text) => updateField("monthly_subscription", text)}
        keyboardType="numeric"
        helper={`Between ${formatNaira(minSubscription)} and ${formatNaira(maxSubscription)} per month`}
        error={errors.monthly_subscription}
      />

      <View style={styles.bankInfoCard}>
        <MaterialIcons name="info" size={20} color={colors.info} />
        <Text style={styles.bankInfoText}>
          Your bank details are required for dividend payments and withdrawals. All
          transactions are secured with bank-grade encryption.
        </Text>
      </View>
    </View>
  );

  // Render Step 5: Profile Photo & Signature
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View style={styles.photoSection}>
        <ProfileImagePicker
          image={formData.avatar_url || null}
          name={formData.full_name || "New User"}
          onImageSelect={handleImageSelect}
        />

        <Text style={styles.photoHelper}>
          Tap the camera icon to upload a profile photo. This is optional but recommended
          for identification purposes.
        </Text>
      </View>

      <SignaturePad
        label="Signature"
        value={formData.signature || null}
        onChange={(signature) => updateField("signature", signature ?? "")}
        helper="Your signature completes the membership form, exactly as it would on paper."
        error={errors.signature}
        onBegin={handleBeginSigning}
        onEnd={handleEndSigning}
      />
    </View>
  );

  // Render Step 6: Review & Pay
  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your details</Text>
        <SummaryRow styles={styles} label="Name" value={formData.full_name} />
        <SummaryRow styles={styles} label="Email" value={formData.email} />
        <SummaryRow styles={styles} label="Phone" value={formData.phone} />
        <SummaryRow styles={styles} label="Date of birth" value={formData.date_of_birth} />
        <SummaryRow styles={styles} label="Address" value={formData.address} />
        <SummaryRow styles={styles} label="Bank" value={`${formData.bank_name} · ${formData.bank_account}`} />
        <SummaryRow
          styles={styles}
          label="Monthly subscription"
          value={formatNaira(Number(formData.monthly_subscription || 0))}
        />
      </View>

      <View style={styles.feeCard}>
        <Text style={styles.summaryTitle}>Registration fees</Text>
        <SummaryRow styles={styles} label="Registration fee" value={formatNaira(registrationFee)} />
        <SummaryRow styles={styles} label="Social fee" value={formatNaira(socialFee)} />
        <View style={styles.feeDivider} />
        <View style={styles.feeTotalRow}>
          <Text style={styles.feeTotalLabel}>Total due now</Text>
          <Text style={styles.feeTotalValue}>{formatNaira(totalDue)}</Text>
        </View>
        <Text style={styles.feeNote}>
          The registration fee is non-refundable. Payment is taken once, now, and
          your membership stays pending until an officer approves it.
        </Text>
      </View>

      {/* The footer of the paper MEM form, made explicit rather than implied. */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => {
          setAcceptedTerms((prev) => !prev);
          if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={acceptedTerms ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={acceptedTerms ? colors.primary : colors.onSurfaceVariant}
        />
        <Text style={styles.termsText}>
          I understand that non-payment of my subscription for three consecutive
          months results in automatic withdrawal from the cooperative, and that the
          registration fee is non-refundable.
        </Text>
      </TouchableOpacity>
      {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

      {errors.general && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color={colors.error} />
          <Text style={styles.errorText}>{errors.general}</Text>
        </View>
      )}
    </View>
  );

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { top: insets.top + theme.spacing.lg }]}>
        <BackButton onPress={handleBack} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
          </View>

          {/* Form Card */}
          <FormCard style={styles.formCard}>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <View
              style={[
                styles.buttonContainer,
                currentStep === 1 && styles.buttonContainerSingle,
              ]}
            >
              {currentStep > 1 && (
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Back"
                    onPress={handleBack}
                    variant="tonal"
                    size="lg"
                    style={styles.buttonFlex}
                  />
                </View>
              )}

              {currentStep < TOTAL_STEPS ? (
                <View
                  style={
                    currentStep === 1 ? styles.buttonWrapperFull : styles.buttonWrapper
                  }
                >
                  <Button
                    title="Continue"
                    onPress={handleNext}
                    variant="primary"
                    size="lg"
                    icon={currentStep === 1 ? "arrow-forward" : undefined}
                    fullWidth={currentStep === 1}
                    style={currentStep > 1 ? styles.buttonFlex : undefined}
                  />
                </View>
              ) : (
                <View style={styles.buttonWrapper}>
                  <Button
                    title={
                      isLoading
                        ? "Processing..."
                        : `Pay ${formatNaira(totalDue)}`
                    }
                    onPress={handleSubmit}
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    style={styles.buttonFlex}
                  />
                </View>
              )}
            </View>
          </FormCard>

          {/* Footer */}
          <View
            style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.lg }]}
          >
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink} onPress={() => router.push("/sign-in")}>
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sign Up Success Modal */}
      <InfoModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        icon="check-circle"
        title="Welcome to DOMICOOP!"
        message="Your application and registration fee have been received. Your membership is pending approval — an officer will review it shortly."
        primaryButtonText="Go to Dashboard"
        onPrimaryPress={handleSuccessModalClose}
        showCloseButton={false}
      />
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 100,
    },
    stepIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    stepContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    stepDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceContainer,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.outlineVariant,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepDotCompleted: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    stepNumber: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    stepNumberActive: {
      color: colors.onPrimary,
    },
    stepLine: {
      // Six dots, not four — the connector shrinks so the rail still fits a
      // narrow screen without wrapping.
      width: 18,
      height: 2,
      backgroundColor: colors.outlineVariant,
      marginHorizontal: theme.spacing.xs,
    },
    stepLineCompleted: {
      backgroundColor: colors.success,
    },
    titleSection: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size["2xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.base,
      color: colors.onSurfaceVariant,
      textAlign: "center",
    },
    formCard: {
      marginBottom: theme.spacing.xl,
    },
    stepContent: {
      gap: theme.spacing.lg,
    },
    addressInput: {
      height: 80,
      textAlignVertical: "top",
    },
    bankInfoCard: {
      flexDirection: "row",
      backgroundColor: colors.infoContainer,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
      alignItems: "flex-start",
    },
    bankInfoText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onInfoContainer,
      lineHeight: theme.typography.size.sm * 1.5,
    },
    photoSection: {
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    photoHelper: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    summaryCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    feeCard: {
      backgroundColor: colors.infoContainer,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    summaryTitle: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.base,
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.base,
    },
    summaryLabel: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    summaryValue: {
      flex: 1.4,
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurface,
      textAlign: "right",
    },
    feeDivider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: theme.spacing.xs,
    },
    feeTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    feeTotalLabel: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.base,
      color: colors.onSurface,
    },
    feeTotalValue: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.lg,
      color: colors.primaryBright,
    },
    feeNote: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: theme.typography.size.xs * 1.6,
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    termsText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight: theme.typography.size.sm * 1.5,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.errorContainer,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
      marginTop: theme.spacing.lg,
    },
    errorText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.error,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: theme.spacing.base,
      marginTop: theme.spacing.xl,
      width: "100%",
      overflow: "hidden",
    },
    buttonContainerSingle: {
      flexDirection: "column",
    },
    buttonWrapper: {
      flex: 1,
      minWidth: 0,
    },
    buttonWrapperFull: {
      width: "100%",
    },
    buttonFlex: {
      width: "100%",
    },
    footer: {
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    footerText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    footerLink: {
      color: colors.primaryBright,
      fontFamily: font("body", "bold"),
    },
  });
