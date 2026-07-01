import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type InfoModalColors = typeof lightColors;

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  icon?: "email" | "check-circle" | "info";
  iconColor?: string;
  title: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  showCloseButton?: boolean;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  icon = "email",
  iconColor,
  title,
  message,
  primaryButtonText = "OK",
  onPrimaryPress,
  showCloseButton = true,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      );
      opacity.value = withDelay(150, withSpring(1));
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    }
    onClose();
  };

  const getIconName = () => {
    switch (icon) {
      case "check-circle":
        return "check-circle";
      case "info":
        return "info";
      case "email":
      default:
        return "mark-email-unread";
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={getIconName()}
              size={64}
              color={iconColor || colors.primary}
            />
          </View>

          <Animated.View style={contentStyle}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, contentStyle]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePrimaryPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>

            {showCloseButton && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: InfoModalColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing["3xl"],
      marginHorizontal: theme.spacing["2xl"],
      alignItems: "center",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
    iconContainer: {
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
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      width: "100%",
      gap: theme.spacing.base,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    closeButton: {
      paddingVertical: theme.spacing.base,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButtonText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
  });

export default InfoModal;
