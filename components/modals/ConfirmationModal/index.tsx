import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { Button } from "@/components/common/Button";
import { DialogShell } from "@/components/modals/DialogShell";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  const { colors } = useTheme();

  return (
    <DialogShell
      visible={visible}
      onRequestClose={onCancel}
      icon={isDestructive ? "warning-amber" : "help-outline"}
      tone={isDestructive ? "error" : "primary"}
      title={title}
      message={message}
    >
      <View style={styles.row}>
        <Button
          title={cancelText}
          onPress={onCancel}
          variant="tonal"
          size="lg"
          style={styles.rowButton}
        />
        <Button
          title={confirmText}
          onPress={onConfirm}
          variant="primary"
          size="lg"
          style={
            isDestructive
              ? { ...styles.rowButton, backgroundColor: colors.error }
              : styles.rowButton
          }
        />
      </View>
    </DialogShell>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.base,
  },
  rowButton: {
    flex: 1,
  },
});

export default ConfirmationModal;
