import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type DropdownColors = typeof lightColors;

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface DropdownSelectProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  icon?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label = "Select",
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  icon = "arrow-drop-down",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholderText]}>
          {selectedOption?.label || placeholder}
        </Text>
        <MaterialIcons name={icon as any} size={24} color={colors.onSurfaceVariant} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  {option.icon && (
                    <MaterialIcons
                      name={option.icon as any}
                      size={20}
                      color={
                        value === option.value ? colors.primary : colors.onSurfaceVariant
                      }
                      style={styles.optionIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const createStyles = (colors: DropdownColors) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.sm,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
    selectButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.base,
      height: 56,
    },
    selectText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    placeholderText: {
      color: colors.onSurfaceVariant,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: theme.borderRadius["2xl"],
      borderTopRightRadius: theme.borderRadius["2xl"],
      maxHeight: "70%",
      paddingBottom: theme.spacing.xl,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    modalTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    optionsList: {
      paddingHorizontal: theme.spacing.lg,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    optionItemSelected: {
      backgroundColor: `${colors.primary}10`,
      borderRadius: theme.borderRadius.lg,
      borderBottomWidth: 0,
      marginVertical: theme.spacing.xs,
    },
    optionIcon: {
      marginRight: theme.spacing.base,
    },
    optionText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    optionTextSelected: {
      fontFamily: font("body", "semibold"),
      color: colors.primary,
    },
  });

export default DropdownSelect;
