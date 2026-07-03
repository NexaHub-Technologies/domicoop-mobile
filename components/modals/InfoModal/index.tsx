import React from "react";
import { Button } from "@/components/common/Button";
import { DialogShell, DialogTone } from "@/components/modals/DialogShell";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  icon?: "email" | "check-circle" | "info";
  iconColor?: string;
  title: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  showCloseButton?: boolean;
}

const ICON_NAMES = {
  email: "mark-email-unread",
  "check-circle": "check-circle",
  info: "info",
} as const;

const ICON_TONES: Record<NonNullable<InfoModalProps["icon"]>, DialogTone> = {
  email: "primary",
  "check-circle": "success",
  info: "primary",
};

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  icon = "email",
  iconColor,
  title,
  message,
  primaryButtonText = "OK",
  onPrimaryPress,
  showCloseButton = true,
}) => {
  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    }
    onClose();
  };

  return (
    <DialogShell
      visible={visible}
      onRequestClose={onClose}
      icon={ICON_NAMES[icon]}
      tone={ICON_TONES[icon]}
      iconColor={iconColor}
      title={title}
      message={message}
    >
      <Button
        title={primaryButtonText}
        onPress={handlePrimaryPress}
        variant="primary"
        size="lg"
        fullWidth
      />
      {showCloseButton && (
        <Button title="Cancel" onPress={onClose} variant="ghost" size="md" fullWidth />
      )}
    </DialogShell>
  );
};

export default InfoModal;
