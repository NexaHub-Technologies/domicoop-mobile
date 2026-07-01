import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type ConfirmationModalColors = typeof lightColors;

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropTouchable} onPress={onCancel} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(300)} style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={isDestructive ? "warning" : "help-outline"}
              size={32}
              color={isDestructive ? colors.error : colors.primary}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isDestructive && styles.destructiveButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isDestructive && styles.destructiveButtonText,
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ConfirmationModalColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    backdropTouchable: {
      flex: 1,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["2xl"],
      marginHorizontal: theme.spacing["2xl"],
      alignItems: "center",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    message: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: theme.spacing.base,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
    },
    cancelButtonText: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    confirmButton: {
      flex: 1,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    confirmButtonText: {
      fontFamily: font("display", "semibold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    destructiveButton: {
      backgroundColor: colors.error,
    },
    destructiveButtonText: {
      color: colors.onError,
    },
  });

export default ConfirmationModal;
