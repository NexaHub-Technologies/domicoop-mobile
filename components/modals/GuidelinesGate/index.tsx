import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@/components/common/Button";
import { DialogShell } from "@/components/modals/DialogShell";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { GUIDELINE_HIGHLIGHTS } from "@/constants/guidelines";

interface GuidelinesGateProps {
  visible: boolean;
  onAcknowledge: () => void;
  onViewFull: () => void;
}

/**
 * Condensed, every-login reminder of the cooperative guidelines. Unlike the
 * full onboarding screen, this is a single-tap acknowledgment — a few key
 * highlights plus a link to the full list — shown on every fresh
 * authentication. Deliberately not dismissible: this is a compliance gate,
 * not a casual dialog, so the backdrop and the Android back button are both
 * inert while it's up.
 */
export const GuidelinesGate: React.FC<GuidelinesGateProps> = ({
  visible,
  onAcknowledge,
  onViewFull,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <DialogShell
      visible={visible}
      onRequestClose={() => {}}
      dismissible={false}
      icon="gavel"
      tone="primary"
      title="Cooperative Guidelines"
      message="Before you continue, a quick reminder of a few key rules:"
      bodyContent={
        <View style={styles.list}>
          {GUIDELINE_HIGHLIGHTS.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.bullet} />
              <Text style={styles.rowText}>{item.text}</Text>
            </View>
          ))}
        </View>
      }
    >
      <Button
        title="I Acknowledge"
        onPress={onAcknowledge}
        variant="primary"
        size="lg"
        fullWidth
      />
      <Button
        title="View Full Guidelines"
        onPress={onViewFull}
        variant="ghost"
        size="md"
        fullWidth
      />
    </DialogShell>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    list: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
      backgroundColor: colors.primary,
    },
    rowText: {
      flex: 1,
      ...typography.styles.bodyText,
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
  });

export default GuidelinesGate;
