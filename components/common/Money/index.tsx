import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { font } from "@/constants/theme";

type MoneySize = "sm" | "md" | "lg" | "xl" | "hero";
type MoneyTone = "default" | "muted" | "onPrimary" | "success" | "error";

interface MoneyProps {
  amount: number;
  /** Currency symbol; NGN by default */
  currency?: string;
  size?: MoneySize;
  tone?: MoneyTone;
  /** Prefix positive amounts with + (negatives always show −) */
  signed?: boolean;
  /** Force decimals on/off; by default decimals show only when present */
  decimals?: boolean;
  style?: TextStyle;
}

const SIZES: Record<MoneySize, { fontSize: number; lineHeight: number; family: string }> = {
  sm: { fontSize: 14, lineHeight: 18, family: font("display", "bold") },
  md: { fontSize: 18, lineHeight: 23, family: font("display", "bold") },
  lg: { fontSize: 24, lineHeight: 30, family: font("display", "bold") },
  xl: { fontSize: 32, lineHeight: 38, family: font("display", "extrabold") },
  hero: { fontSize: 40, lineHeight: 46, family: font("display", "extrabold") },
};

export const formatAmount = (amount: number, decimals?: boolean): string => {
  const abs = Math.abs(amount);
  const showDecimals = decimals ?? !Number.isInteger(abs);
  const fixed = abs.toFixed(showDecimals ? 2 : 0);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
};

export const Money: React.FC<MoneyProps> = ({
  amount,
  currency = "₦",
  size = "md",
  tone = "default",
  signed = false,
  decimals,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const sizeSpec = SIZES[size];

  const toneColor: Record<MoneyTone, string> = {
    default: colors.onSurface,
    muted: colors.onSurfaceVariant,
    onPrimary: colors.onPrimary,
    success: colors.success,
    error: colors.error,
  };
  const color = toneColor[tone];

  const sign = amount < 0 ? "−" : signed && amount > 0 ? "+" : "";

  return (
    <Text
      style={[
        styles.amount,
        { fontFamily: sizeSpec.family, fontSize: sizeSpec.fontSize, lineHeight: sizeSpec.lineHeight, color },
        style,
      ]}
    >
      {sign}
      <Text
        style={[
          styles.currency,
          {
            fontSize: Math.round(sizeSpec.fontSize * 0.7),
            color: tone === "onPrimary" ? color : colors.onSurfaceVariant,
          },
        ]}
      >
        {currency}
      </Text>
      {formatAmount(amount, decimals)}
    </Text>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    amount: {
      fontVariant: ["tabular-nums"],
    },
    currency: {
      fontFamily: font("display", "semibold"),
      opacity: 0.9,
    },
  });
