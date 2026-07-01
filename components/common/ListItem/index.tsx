import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: keyof typeof MaterialIcons.glyphMap;
  /** Tint for the leading icon circle; defaults to primary */
  leadingColor?: string;
  /** Trailing content: a string renders as muted text, otherwise a node */
  trailing?: React.ReactNode;
  /** Chevron shown automatically when pressable; set false to hide */
  chevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leadingIcon,
  leadingColor,
  trailing,
  chevron,
  onPress,
  destructive = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const iconTint = destructive ? colors.error : (leadingColor ?? colors.primaryBright);
  const showChevron = chevron ?? Boolean(onPress);

  const content = (
    <>
      {leadingIcon && (
        <View style={[styles.iconCircle, { backgroundColor: `${iconTint}14` }]}>
          <MaterialIcons name={leadingIcon} size={20} color={iconTint} />
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={[styles.title, destructive && { color: colors.error }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {typeof trailing === "string" ? (
        <Text style={styles.trailingText}>{trailing}</Text>
      ) : (
        trailing
      )}
      {showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, style]}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.base,
      gap: theme.spacing.base,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.lg,
      justifyContent: "center",
      alignItems: "center",
    },
    textBlock: {
      flex: 1,
    },
    title: {
      ...theme.typography.styles.bodyMedium,
      fontSize: theme.typography.size.base,
      lineHeight: 20,
      color: colors.onSurface,
    },
    subtitle: {
      ...theme.typography.styles.bodySmall,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    trailingText: {
      ...theme.typography.styles.bodySmall,
      color: colors.onSurfaceVariant,
    },
  });
