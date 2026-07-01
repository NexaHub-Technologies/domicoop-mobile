import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.button, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.onSurface} />
      ) : (
        <>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.text}>Sign in with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.base,
    },
    disabled: {
      opacity: 0.5,
    },
    googleIcon: {
      fontFamily: theme.typography.fontFamily.headline,
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
    },
    text: {
      fontFamily: theme.typography.fontFamily.headline,
      fontSize: theme.typography.size.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: colors.onSurface,
    },
  });
