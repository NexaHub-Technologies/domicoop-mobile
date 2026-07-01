import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

type SecurityBadgeColors = typeof lightColors;

interface SecurityBadgeProps {
  style?: any;
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ style }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <MaterialIcons
        name="verified-user"
        size={14}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>Secured Vault</Text>
    </View>
  );
};

const createStyles = (colors: SecurityBadgeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.surface}CC`,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      ...theme.shadows.sm,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    text: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurface,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.tight,
    },
  });
