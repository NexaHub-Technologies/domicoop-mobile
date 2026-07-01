import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type NotificationMenuColors = typeof lightColors;

interface NotificationMenuProps {
  visible: boolean;
  onClose: () => void;
  onClearAll: () => void;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  visible,
  onClose,
  onClearAll,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleClearAll = () => {
    onClearAll();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-sweep" size={24} color={colors.error} />
            <Text style={styles.menuItemTextDanger}>Clear all notifications</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onClose} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.menuItemText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (colors: NotificationMenuColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: 80,
      paddingRight: theme.spacing.lg,
    },
    menu: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.sm,
      minWidth: 200,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.base,
    },
    menuItemText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    menuItemTextDanger: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.base,
      color: colors.error,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: theme.spacing.xs,
    },
  });

export default NotificationMenu;
