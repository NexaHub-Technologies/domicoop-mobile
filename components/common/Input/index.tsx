import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.widest,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.xs,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 56,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 0,
    },
    inputContainerFocused: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    inputContainerError: {
      borderWidth: 2,
      borderColor: colors.error,
      backgroundColor: colors.errorContainer,
    },
    inputContainerDisabled: {
      backgroundColor: colors.surfaceContainer,
      opacity: 0.6,
    },
    leftIcon: {
      marginRight: theme.spacing.md,
    },
    rightIcon: {
      marginLeft: theme.spacing.md,
    },
    input: {
      flex: 1,
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.md,
      color: colors.onSurface,
      height: "100%",
    },
    inputWithLeftIcon: {
      paddingLeft: theme.spacing.sm,
    },
    inputWithRightIcon: {
      paddingRight: theme.spacing.sm,
    },
    helper: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.md,
      marginLeft: theme.spacing.base,
    },
    errorText: {
      color: colors.error,
    },
  });

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={colors.onSurfaceVariant}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <MaterialIcons
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && onRightIconPress && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <MaterialIcons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && !onRightIconPress && (
          <View style={styles.rightIcon}>
            <MaterialIcons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
          </View>
        )}
      </View>
      {(error || helper) && (
        <Text style={[styles.helper, error && styles.errorText]}>{error || helper}</Text>
      )}
    </View>
  );
};
