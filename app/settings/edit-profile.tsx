import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { typography } from '@/constants/typography';
import { createElevation } from '@/constants/theme';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { DropdownSelect } from '@/components/forms/DropdownSelect';
import { members } from "@/lib/api/members.api";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "@/hooks/useProfile";
import { InfoModal } from '@/components/modals/InfoModal';

const NIGERIAN_BANKS = [
  { value: '044', label: 'Access Bank' },
  { value: '023', label: 'Citibank Nigeria' },
  { value: '050', label: 'Ecobank Nigeria' },
  { value: '070', label: 'Fidelity Bank' },
  { value: '011', label: 'First Bank of Nigeria' },
  { value: '214', label: 'First City Monument Bank' },
  { value: '058', label: 'Guaranty Trust Bank' },
  { value: '030', label: 'Heritage Bank' },
  { value: '301', label: 'Jaiz Bank' },
  { value: '082', label: 'Keystone Bank' },
  { value: '076', label: 'Polaris Bank' },
  { value: '039', label: 'Stanbic IBTC Bank' },
  { value: '232', label: 'Sterling Bank' },
  { value: '032', label: 'Union Bank of Nigeria' },
  { value: '033', label: 'United Bank for Africa' },
  { value: '215', label: 'Unity Bank' },
  { value: '035', label: 'Wema Bank' },
  { value: '057', label: 'Zenith Bank' },
  { value: '559', label: 'Coronation Merchant Bank' },
  { value: '502', label: 'Providus Bank' },
  { value: '526', label: 'Parallex Bank' },
  { value: '503', label: 'SunTrust Bank' },
  { value: '101', label: 'ProvidusBank' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
  const elevations = createElevation(colors);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bank_name: '',
    bank_code: '',
    bank_account: '',
    next_of_kin: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await members.getProfile();
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bank_name: profile.bank_name || '',
        bank_code: profile.bank_code || '',
        bank_account: profile.bank_account || '',
        next_of_kin: profile.next_of_kin || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updated = await members.updateProfile(formData);
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBankSelect = (code: string) => {
    const bank = NIGERIAN_BANKS.find((b) => b.value === code);
    setFormData((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: bank?.label ?? prev.bank_name,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <ScreenHeader title="Edit Profile" onBack={handleBack} />

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
          {/* Personal Information Section */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.fieldGroup}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
                leftIcon="person"
              />

              <Input
                label="Phone Number"
                placeholder="+234 801 234 5678"
                value={formData.phone}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                leftIcon="phone-iphone"
              />

              <Input
                label="Address"
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                multiline
                leftIcon="location-on"
              />

              <View>
                <Input
                  label="Next of Kin"
                  placeholder="Name - Phone Number"
                  value={formData.next_of_kin}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, next_of_kin: text }))
                  }
                  leftIcon="people"
                  helper="Emergency contact person"
                />
              </View>
            </View>
          </Animated.View>

          {/* Bank Details Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>

            <View style={styles.fieldGroup}>
              <DropdownSelect
                label="Bank"
                value={formData.bank_code}
                options={NIGERIAN_BANKS}
                onSelect={handleBankSelect}
                placeholder="Select your bank"
                icon="account-balance"
              />

              <View>
                <Input
                  label="Account Number"
                  placeholder="1234567890"
                  value={formData.bank_account}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, bank_account: text }))
                  }
                  keyboardType="numeric"
                  leftIcon="account-balance"
                  helper="10-digit bank account number"
                />
              </View>
            </View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(400)}
        style={[styles.buttonContainer, elevations.raised]}
      >
        {isSaving ? (
          <View style={[styles.submitButton, styles.submitButtonDisabled]}>
            <ActivityIndicator size="small" color={colors.onPrimary} />
          </View>
        ) : (
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon="check-circle"
            iconPosition="right"
            fullWidth
          />
        )}
      </Animated.View>

      {/* Success Modal */}
      <InfoModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        icon="check-circle"
        iconColor={colors.success || colors.primary}
        title="Profile Updated"
        message="Your profile has been updated successfully."
        primaryButtonText="Done"
        showCloseButton={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
      marginBottom: theme.spacing.lg,
    },
    fieldGroup: {
      gap: theme.spacing.lg,
    },
    bottomPadding: {
      height: 100,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.lg,
      paddingBottom: Math.max(bottomInset, theme.spacing.lg) + theme.spacing.lg,
      backgroundColor: colors.background,
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
  });
