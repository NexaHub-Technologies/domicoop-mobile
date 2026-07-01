import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  /** Large: title drops below the nav row in display type */
  large?: boolean;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightAction,
  large = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
        {!large && (
          <Text style={styles.rowTitle} numberOfLines={1}>
            {title}
          </Text>
        )}
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <MaterialIcons name={rightAction.icon} size={22} color={colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
      {large && <Text style={styles.largeTitle}>{title}</Text>}
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.base,
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: colors.surfaceContainer,
      justifyContent: "center",
      alignItems: "center",
    },
    rowTitle: {
      ...theme.typography.styles.cardTitle,
      flex: 1,
      textAlign: "center",
      color: colors.onSurface,
      marginHorizontal: theme.spacing.base,
    },
    largeTitle: {
      ...theme.typography.styles.screenTitle,
      color: colors.onSurface,
      marginTop: theme.spacing.lg,
    },
  });
