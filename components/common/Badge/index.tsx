import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

export type BadgeStatus = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  status: BadgeStatus;
  label: string;
  /** Show the small status dot before the label */
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, dot = true, style }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const palette: Record<BadgeStatus, { bg: string; fg: string; dot: string }> = {
    success: { bg: colors.successContainer, fg: colors.onSuccessContainer, dot: colors.success },
    warning: { bg: colors.warningContainer, fg: colors.onWarningContainer, dot: colors.warning },
    error: { bg: colors.errorContainer, fg: colors.onErrorContainer, dot: colors.error },
    info: { bg: colors.infoContainer, fg: colors.onInfoContainer, dot: colors.info },
    neutral: { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant, dot: colors.outline },
  };
  const tone = palette[status];

  return (
    <View style={[styles.container, { backgroundColor: tone.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: tone.dot }]} />}
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing.sm,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: theme.borderRadius.full,
    },
    label: {
      ...theme.typography.styles.label,
      fontSize: theme.typography.size.sm,
      lineHeight: 16,
    },
  });
