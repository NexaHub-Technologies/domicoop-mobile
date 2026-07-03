import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { loanConfig } from "@/constants/loans";
import { formatCurrencyNoSign } from "@/lib/utils/format";

type AmountColors = typeof lightColors;

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
  minAmount?: number;
  maxAmount?: number;
}

const formatAmountForDisplay = (value: string): string => {
  if (!value) return "";
  const numericValue = value.replace(/,/g, "");
  if (isNaN(Number(numericValue))) return value;
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  error,
  label = "Loan Amount",
  minAmount = loanConfig.minAmount,
  maxAmount = loanConfig.maxAmount,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/,/g, "");
    const numericOnly = cleaned.replace(/[^0-9]/g, "");
    onChangeText(numericOnly);
  };

  const displayValue = formatAmountForDisplay(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Text style={styles.currencySymbol}>₦</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.limitsContainer}>
        <Text style={styles.limitText}>
          Min: ₦{formatCurrencyNoSign(minAmount)}
        </Text>
        <Text style={styles.limitText}>
          Max: ₦{formatCurrencyNoSign(maxAmount)}
        </Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: AmountColors) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.base,
    },
    inputError: {
      borderColor: colors.error,
    },
    currencySymbol: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      color: colors.onSurfaceVariant,
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontFamily: font("display", "bold"),
      fontSize: typography.size.xl,
      fontVariant: ["tabular-nums"],
      color: colors.onSurface,
      padding: 0,
    },
    limitsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.xs,
    },
    limitText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    errorText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.error,
      marginTop: theme.spacing.xs,
    },
  });

export default AmountInput;