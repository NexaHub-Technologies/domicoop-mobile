import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
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

type SuccessModalColors = typeof lightColors;

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const onCloseRef = useRef(onClose);

  // Update ref when onClose changes
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      );
      opacity.value = withDelay(200, withSpring(1));

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        onCloseRef.current();
      }, 2000);

      return () => clearTimeout(timer);
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

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={64} color={colors.primary} />
          </View>

          <Animated.View style={contentStyle}>
            <Text style={styles.title}>Loan Request Being Processed</Text>
            <Text style={styles.message}>
              Most decisions are made within 24 hours. We&apos;ll notify you once your
              application is reviewed.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: SuccessModalColors) =>
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
      lineHeight: 20,
    },
  });

export default SuccessModal;
