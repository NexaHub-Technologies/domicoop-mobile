import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font, typography } from "@/constants/theme";

export type DialogTone = "primary" | "success" | "warning" | "error";

interface DialogShellProps {
  visible: boolean;
  onRequestClose: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: DialogTone;
  /** Overrides the tone's icon/chip color. */
  iconColor?: string;
  title: string;
  message?: string;
  /** Tapping the backdrop closes the dialog. Default true. */
  dismissible?: boolean;
  /** Action buttons, rendered below the perforation. */
  children?: React.ReactNode;
}

const ENTER_MS = 320;
const EXIT_MS = 180;
const STAMP_DELAY_MS = 120;
const STAMP_MS = 220;
const DASH_COUNT = 26;

const enterEasing = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Shared dialog chassis — the "ledger slip". A bottom-docked, hairline-
 * bordered card that slides up without bounce; the status icon is stamped
 * into a tinted chip, and a perforated tear-line separates the record from
 * its actions. All app dialogs (Success/Info/Confirmation) build on this.
 */
export const DialogShell: React.FC<DialogShellProps> = ({
  visible,
  onRequestClose,
  icon,
  tone = "primary",
  iconColor,
  title,
  message,
  dismissible = true,
  children,
}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const styles = createStyles(colors, isDarkMode);

  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);
  const stamp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      progress.value = withTiming(1, {
        duration: reducedMotion ? 120 : ENTER_MS,
        easing: enterEasing,
      });
      stamp.value = reducedMotion
        ? withTiming(1, { duration: 120 })
        : withDelay(
            STAMP_DELAY_MS,
            withTiming(1, { duration: STAMP_MS, easing: Easing.out(Easing.cubic) }),
          );
    } else {
      stamp.value = 0;
      progress.value = withTiming(
        0,
        { duration: reducedMotion ? 80 : EXIT_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setRendered)(false);
        },
      );
    }
  }, [visible, reducedMotion, progress, stamp]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: reducedMotion ? 0 : (1 - progress.value) * 48 },
    ],
  }));

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [{ scale: reducedMotion ? 1 : 1.6 - 0.6 * stamp.value }],
  }));

  const toneColors: Record<DialogTone, string> = {
    primary: isDarkMode ? colors.primaryBright : colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };
  const accent = iconColor || toneColors[tone];

  return (
    <Modal
      transparent
      visible={rendered}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissible ? onRequestClose : undefined}
            accessibilityLabel="Close dialog"
          />
        </Animated.View>

        <View
          pointerEvents="box-none"
          style={[styles.dock, { paddingBottom: insets.bottom + theme.spacing.lg }]}
        >
          <Animated.View
            style={[styles.panel, panelStyle]}
            accessibilityViewIsModal
            accessibilityRole="alert"
          >
            <Animated.View
              style={[styles.chip, { backgroundColor: `${accent}1F` }, stampStyle]}
            >
              <MaterialIcons name={icon} size={22} color={accent} />
            </Animated.View>

            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}

            {children ? (
              <>
                <View style={styles.perforation}>
                  {Array.from({ length: DASH_COUNT }, (_, i) => (
                    <View key={i} style={styles.dash} />
                  ))}
                </View>
                <View style={styles.actions}>{children}</View>
              </>
            ) : null}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: typeof lightColors, isDarkMode: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    dock: {
      flex: 1,
      justifyContent: "flex-end",
      paddingHorizontal: theme.spacing.lg,
    },
    panel: {
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
      backgroundColor: isDarkMode ? colors.surfaceContainerHigh : colors.surface,
      borderRadius: theme.borderRadius["3xl"],
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: theme.spacing["2xl"],
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 10,
    },
    chip: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurface,
      marginTop: theme.spacing.lg,
      letterSpacing: typography.letterSpacing.tight,
    },
    message: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurfaceVariant,
      lineHeight: typography.size.base * 1.55,
      marginTop: theme.spacing.sm,
    },
    perforation: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing["2xl"],
      marginBottom: theme.spacing.xl,
    },
    dash: {
      width: 6,
      height: 1.5,
      borderRadius: 1,
      backgroundColor: colors.outlineVariant,
    },
    actions: {
      gap: theme.spacing.sm,
    },
  });

export default DialogShell;
