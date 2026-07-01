import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

interface PasswordStrengthProps {
  password: string;
  showLabel?: boolean;
}

type StrengthLevel = "weak" | "medium" | "strong" | "none";

const calculateStrength = (password: string): StrengthLevel => {
  if (!password || password.length === 0) return "none";

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
};

const getStrengthColor = (
  strength: StrengthLevel,
  colors: typeof lightColors,
): string => {
  switch (strength) {
    case "weak":
      return colors.error;
    case "medium":
      return colors.tertiary;
    case "strong":
      return colors.success;
    default:
      return colors.outlineVariant;
  }
};

const getStrengthLabel = (strength: StrengthLevel): string => {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "strong":
      return "Strong";
    default:
      return "";
  }
};

const getProgressWidth = (strength: StrengthLevel): number => {
  switch (strength) {
    case "weak":
      return 33;
    case "medium":
      return 66;
    case "strong":
      return 100;
    default:
      return 0;
  }
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showLabel = true,
}) => {
  const { colors } = useTheme();
  const strength = calculateStrength(password);
  const strengthColor = getStrengthColor(strength, colors);
  const progressWidth = getProgressWidth(strength);

  if (strength === "none") return null;

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: strengthColor, width: `${progressWidth}%` },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: strengthColor }]}>
          {getStrengthLabel(strength)}
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.base,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    label: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.xs - 1, // 11px
      textTransform: "uppercase",
      letterSpacing: typography.letterSpacing.wider,
      marginTop: theme.spacing.xs,
    },
  });

export default PasswordStrength;
