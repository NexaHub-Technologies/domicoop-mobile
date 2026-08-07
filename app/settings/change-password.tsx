import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
  const elevations = createElevation(colors);
  const [isSaving, setIsSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { current?: string; new?: string; confirm?: string } = {};

    if (!passwords.current) {
      newErrors.current = 'Current password is required';
    }

    if (!passwords.new) {
      newErrors.new = 'New password is required';
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
    }

    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your new password';
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSaving(false);
    Alert.alert('Success', 'Password changed successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <ScreenHeader title="Change Password" onBack={handleBack} />

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
          {/* Instructions */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Create a strong password to keep your account secure. Your new
              password must be at least 6 characters long.
            </Text>
          </Animated.View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <Input
                label="Current Password"
                placeholder="Enter current password"
                value={passwords.current}
                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                secureTextEntry
                error={errors.current}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={passwords.new}
                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                secureTextEntry
                error={errors.new}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <Input
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                secureTextEntry
                error={errors.confirm}
              />
            </Animated.View>
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={[styles.buttonContainer, elevations.raised]}
      >
        {isSaving ? (
          <View style={[styles.submitButton, styles.submitButtonDisabled]}>
            <ActivityIndicator color={colors.onPrimary} />
          </View>
        ) : (
          <Button
            title="Update Password"
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon="check-circle"
            iconPosition="right"
            fullWidth
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors, bottomInset: number) => StyleSheet.create({
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
  instructions: {
    marginBottom: theme.spacing.lg,
  },
  instructionsText: {
    ...typography.styles.bodyText,
    color: colors.onSurfaceVariant,
  },
  formContainer: {
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
