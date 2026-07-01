import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type ToggleItemColors = typeof lightColors;

interface ToggleItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ToggleItem: React.FC<ToggleItemProps> = ({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      value ? 1 : 0,
      [0, 1],
      [colors.outlineVariant, colors.primary],
    );

    return {
      backgroundColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = withSpring(value ? 20 : 0, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => !disabled && onValueChange(!value)}
        activeOpacity={disabled ? 1 : 0.7}
        style={styles.toggleContainer}
        disabled={disabled}
      >
        <Animated.View style={[styles.track, animatedStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </TouchableOpacity>

      {disabled && value && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ON</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ToggleItemColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      backgroundColor: colors.surface,
    },
    disabled: {
      opacity: 0.6,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: 2,
    },
    subtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    toggleContainer: {
      marginLeft: theme.spacing.base,
    },
    track: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 3,
      justifyContent: "center",
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.onPrimary,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    badge: {
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginLeft: theme.spacing.sm,
    },
    badgeText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.primary,
    },
  });

export default ToggleItem;
