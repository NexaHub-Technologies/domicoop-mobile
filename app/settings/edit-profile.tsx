import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTheme, lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { font } from "@/constants/theme";
import { typography } from '@/constants/typography';
import { members } from "@/lib/api/members.api";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "@/hooks/useProfile";
import { InfoModal } from '@/components/modals/InfoModal';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);

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

  const handleBankSelect = (code: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: name,
    }));
    setShowBankSelector(false);
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
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Profile</Text>
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
          {/* Personal Information Section */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
                <MaterialIcons
                  name="person"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                  placeholder="+234 801 234 5678"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="phone-pad"
                />
                <MaterialIcons
                  name="phone-iphone"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.onSurfaceVariant}
                  multiline
                />
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Next of Kin</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.next_of_kin}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, next_of_kin: text }))}
                  placeholder="Name - Phone Number"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
                <MaterialIcons
                  name="people"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </View>
              <Text style={styles.helperText}>Emergency contact person</Text>
            </View>
          </Animated.View>

          {/* Bank Details Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Bank Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowBankSelector(!showBankSelector)}
              >
                <Text
                  style={[
                    styles.input,
                    !formData.bank_name && styles.placeholder,
                  ]}
                >
                  {formData.bank_name || 'Select your bank'}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </TouchableOpacity>

              {showBankSelector && (
                <View style={styles.bankList}>
                  <ScrollView style={styles.bankScrollView} nestedScrollEnabled>
                    {NIGERIAN_BANKS.map((bank) => (
                      <TouchableOpacity
                        key={bank.value}
                        style={styles.bankOption}
                        onPress={() => handleBankSelect(bank.value, bank.label)}
                      >
                        <Text style={styles.bankOptionText}>{bank.label}</Text>
                        {formData.bank_code === bank.value && (
                          <MaterialIcons name="check" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.bank_account}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, bank_account: text }))
                  }
                  placeholder="1234567890"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              </View>
              <Text style={styles.helperText}>10-digit bank account number</Text>
            </View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <AnimatedTouchable
          entering={FadeInUp.delay(300).duration(400)}
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Changes</Text>
              <MaterialIcons name="check-circle" size={20} color={colors.onPrimary} />
            </>
          )}
        </AnimatedTouchable>
      </View>

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
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: theme.spacing.lg,
    },
    sectionSpacing: {
      marginTop: theme.spacing.xl,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 56,
    },
    input: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      paddingVertical: theme.spacing.base,
    },
    placeholder: {
      color: colors.onSurfaceVariant,
    },
    inputIcon: {
      opacity: 0.5,
    },
    helperText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    bankList: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.sm,
      maxHeight: 200,
    },
    bankScrollView: {
      maxHeight: 200,
    },
    bankOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    bankOptionText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurface,
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
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    saveButton: {
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
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
  });
