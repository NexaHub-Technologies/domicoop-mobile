import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

interface TransactionDetailCardProps {
  icon: string;
  label: string;
  value: string;
  showCopy?: boolean;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
      padding: theme.spacing.base,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    value: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    copyButton: {
      padding: theme.spacing.sm,
    },
  });

export const TransactionDetailCard: React.FC<TransactionDetailCardProps> = ({
  icon,
  label,
  value,
  showCopy = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);

    if (Platform.OS === "android") {
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", "Value copied to clipboard");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={20} color={colors.secondary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      {showCopy && (
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          <MaterialIcons name="content-copy" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TransactionDetailCard;
