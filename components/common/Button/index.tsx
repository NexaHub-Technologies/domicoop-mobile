import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    fullWidth: {
      width: "100%",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      ...theme.typography.styles.headline,
      textAlign: "center",
    },
    iconLeft: {
      marginRight: theme.spacing.md,
    },
    iconRight: {
      marginLeft: theme.spacing.md,
    },
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      opacity: 0.7,
    },
  });

type ButtonVariant = "primary" | "secondary" | "tonal" | "outlined" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "right",
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "primary":
        return {
          container: {
            backgroundColor: colors.primary,
            ...theme.shadows.lg,
          },
          text: {
            color: colors.onPrimary,
          },
        };
      case "secondary":
        return {
          container: {
            backgroundColor: colors.secondaryContainer,
          },
          text: {
            color: colors.onSecondaryFixed,
          },
        };
      case "tonal":
        return {
          container: {
            backgroundColor: colors.surfaceContainer,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
          },
          text: {
            color: colors.onSurface,
          },
        };
      case "outlined":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: colors.outline,
          },
          text: {
            color: colors.primary,
          },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
          },
          text: {
            color: colors.primary,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
          },
          text: {
            fontSize: theme.typography.size.sm,
          },
        };
      case "lg":
        return {
          container: {
            paddingVertical: theme.spacing.xl,
            paddingHorizontal: theme.spacing["2xl"],
            borderRadius: theme.borderRadius.xl,
          },
          text: {
            fontSize: theme.typography.size.lg,
          },
        };
      case "md":
      default:
        return {
          container: {
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.xl,
          },
          text: {
            fontSize: theme.typography.size.base,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleValue }] }]}>
        {icon && iconPosition === "left" && !loading && (
          <MaterialIcons
            name={icon}
            size={20}
            color={variantStyles.text.color}
            style={styles.iconLeft}
          />
        )}
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {loading ? "Loading..." : title}
        </Text>
        {icon && iconPosition === "right" && !loading && (
          <MaterialIcons
            name={icon}
            size={20}
            color={variantStyles.text.color}
            style={styles.iconRight}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
