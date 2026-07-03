import React from "react";
import { Button } from "@/components/common/Button";
import { DialogShell } from "@/components/modals/DialogShell";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title = "Success",
  message,
  buttonText = "Done",
}) => {
  return (
    <DialogShell
      visible={visible}
      onRequestClose={onClose}
      icon="task-alt"
      tone="success"
      title={title}
      message={message}
    >
      <Button title={buttonText} onPress={onClose} variant="primary" size="lg" fullWidth />
    </DialogShell>
  );
};

export default SuccessModal;
