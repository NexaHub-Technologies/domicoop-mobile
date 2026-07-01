import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
import { InfoModal } from "@/components/modals/InfoModal";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import type { SignUpData, SignUpErrors, SignUpStep } from "@/types";
import { auth } from "@/lib/api/auth.api";
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

const TOTAL_STEPS = 4;

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  // Form state
  const [currentStep, setCurrentStep] = useState<SignUpStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
    bank_name: "",
    bank_account: "",
    bank_code: "",
    avatar_url: "",
    next_of_kin: "",
  });

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
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
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

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await auth.register(formData);
      setShowVerificationModal(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification modal close
  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
    router.replace("/sign-in");
  };

  // Handle image selection
  const handleImageSelect = (imageUri: string) => {
    updateField("avatar_url", imageUri);
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
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
        return "Bank Details";
      case 4:
        return "Profile Photo";
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
        return "Add your bank details for transactions";
      case 4:
        return "Add a profile photo (optional)";
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

      <Input
        label="Phone Number"
        placeholder="+234 123 456 7890"
        value={formData.phone}
        onChangeText={(text) => updateField("phone", text)}
        keyboardType="phone-pad"
        error={errors.phone}
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
        label="Next of Kin (Optional)"
        placeholder="Name - Phone Number"
        value={formData.next_of_kin || ""}
        onChangeText={(text) => updateField("next_of_kin", text)}
        helper="Emergency contact information"
      />
    </View>
  );

  // Render Step 3: Bank Details
  const renderStep3 = () => (
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

      <View style={styles.bankInfoCard}>
        <MaterialIcons name="info" size={20} color={colors.primary} />
        <Text style={styles.bankInfoText}>
          Your bank details are required for dividend payments and withdrawals. All
          transactions are secured with bank-grade encryption.
        </Text>
      </View>
    </View>
  );

  // Render Step 4: Profile Photo
  const renderStep4 = () => (
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
                    title={isLoading ? "Creating Account..." : "Create Account"}
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

      {/* Email Verification Modal */}
      <InfoModal
        visible={showVerificationModal}
        onClose={handleVerificationModalClose}
        icon="email"
        title="Verify Your Email"
        message="Your account has been created. Please check your email (including spam folder) and click the verification link to activate your account."
        primaryButtonText="Go to Sign In"
        onPrimaryPress={handleVerificationModalClose}
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
      width: 40,
      height: 2,
      backgroundColor: colors.outlineVariant,
      marginHorizontal: theme.spacing.sm,
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
      backgroundColor: colors.primaryFixed,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
      alignItems: "flex-start",
    },
    bankInfoText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onPrimaryFixed,
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
      color: colors.primary,
      fontFamily: font("body", "bold"),
    },
  });
