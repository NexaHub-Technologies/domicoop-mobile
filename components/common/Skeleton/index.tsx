import React, { useEffect } from "react";
import { StyleSheet, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

type SkeletonVariant = "text" | "card" | "row" | "circle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle;
}

const VARIANT_DEFAULTS: Record<SkeletonVariant, ViewStyle> = {
  text: { width: "60%", height: 14, borderRadius: theme.borderRadius.sm },
  card: { width: "100%", height: 120, borderRadius: theme.borderRadius["2xl"] },
  row: { width: "100%", height: 56, borderRadius: theme.borderRadius.lg },
  circle: { width: 40, height: 40, borderRadius: theme.borderRadius.full },
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.5, { duration: 600 }),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        VARIANT_DEFAULTS[variant],
        width !== undefined && { width },
        height !== undefined && { height },
        animatedStyle,
        style,
      ]}
    />
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surfaceContainerHigh,
    },
  });
