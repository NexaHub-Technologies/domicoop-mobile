import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
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

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

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

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
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
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Change Password</Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Instructions */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Create a strong password to keep your account secure. Your new password must be at least 6 characters long.
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Current Password */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.fieldContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={passwords.current}
                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                placeholder="Enter current password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry={!showPassword.current}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword.current ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
            {errors.current && <Text style={styles.errorText}>{errors.current}</Text>}
          </Animated.View>

          {/* New Password */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.fieldContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={passwords.new}
                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                placeholder="Enter new password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry={!showPassword.new}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword.new ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
            {errors.new && <Text style={styles.errorText}>{errors.new}</Text>}
          </Animated.View>

          {/* Confirm New Password */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                placeholder="Confirm new password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry={!showPassword.confirm}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword.confirm ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
            {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
          </Animated.View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <AnimatedTouchable
          entering={FadeInUp.delay(500).duration(400)}
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <Text style={styles.saveButtonText}>Updating...</Text>
          ) : (
            <>
              <Text style={styles.saveButtonText}>Update Password</Text>
              <MaterialIcons name="check-circle" size={20} color={colors.onPrimary} />
            </>
          )}
        </AnimatedTouchable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors, bottomInset: number) => StyleSheet.create({
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
  instructions: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  instructionsText: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  fieldContainer: {
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
    paddingLeft: theme.spacing.lg,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: font("body", "regular"),
    fontSize: typography.size.base,
    color: colors.onSurface,
  },
  eyeButton: {
    padding: theme.spacing.base,
  },
  errorText: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: theme.spacing.xs,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
