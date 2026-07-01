import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { createElevation } from "@/constants/theme";

type CardElevation = "flat" | "raised" | "glow";

interface CardProps {
  children: React.ReactNode;
  /**
   * Elevation discipline: `flat` (hairline border) is the default resting
   * surface. `glow` is reserved for at most two surfaces per screen —
   * the hero money card and the primary CTA.
   */
  elevation?: CardElevation;
  padded?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = "flat",
  padded = true,
  onPress,
  style,
}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

  const surface = {
    backgroundColor: isDarkMode ? colors.surfaceContainer : colors.surface,
  };

  const containerStyle = [
    styles.base,
    surface,
    elevation === "flat" && elevations.flat,
    elevation === "raised" && elevations.raised,
    elevation === "glow" && elevations.glowLg,
    !padded && styles.unpadded,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.borderRadius["2xl"],
      padding: theme.spacing.lg,
    },
    unpadded: {
      padding: 0,
    },
  });
