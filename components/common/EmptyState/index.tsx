import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { Button } from "@/components/common/Button";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={28} color={colors.onSurfaceVariant} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="tonal"
          size="sm"
          style={styles.action}
        />
      )}
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: theme.spacing["4xl"],
      paddingHorizontal: theme.spacing["2xl"],
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.full,
      backgroundColor: colors.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.styles.cardTitle,
      color: colors.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    message: {
      ...theme.typography.styles.bodyText,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 260,
    },
    action: {
      marginTop: theme.spacing.xl,
    },
  });
