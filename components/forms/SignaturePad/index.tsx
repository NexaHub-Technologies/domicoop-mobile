import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import SignatureScreen, {
  type SignatureViewRef,
} from "react-native-signature-canvas";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

export interface SignaturePadProps {
  label?: string;
  helper?: string;
  /** Base64 PNG data URL of the confirmed signature, or null while unsigned. */
  value: string | null;
  onChange: (signature: string | null) => void;
  error?: string;
  /** Called when the user touches down to begin drawing a signature stroke. */
  onBegin?: () => void;
  /** Called when the user finishes a signature stroke or dismisses the pad. */
  onEnd?: () => void;
}

const PAD_HEIGHT = 220;

/**
 * On-screen signature capture, standing in for the SIGNATURE line on the paper
 * MEM form.
 *
 * Wraps `react-native-signature-canvas`, which draws into a WebView canvas and
 * hands back a base64 PNG data URL. That is the shape the registration
 * endpoint expects, so it is stored verbatim rather than re-encoded.
 *
 * Once signed, the pad is replaced by a preview: re-mounting the canvas to
 * show an existing signature would lose it on the next stroke, and "sign
 * again" is a clearer affordance than an editable canvas that silently
 * discards what was there.
 */
export const SignaturePad: React.FC<SignaturePadProps> = ({
  label = "Signature",
  helper,
  value,
  onChange,
  error,
  onBegin,
  onEnd,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const ref = useRef<SignatureViewRef>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Always ensure any active scroll lock is released when unmounting
  useEffect(() => {
    return () => {
      onEnd?.();
    };
  }, [onEnd]);

  const handleOK = useCallback(
    (signature: string) => {
      onChange(signature);
      setHasStrokes(false);
      onEnd?.();
    },
    [onChange, onEnd],
  );

  // The library only surfaces the drawing through onOK, which fires after
  // readSignature() — so "Done" is a two-step handshake, not a direct read.
  const handleDone = useCallback(() => {
    ref.current?.readSignature();
    onEnd?.();
  }, [onEnd]);

  const handleClear = useCallback(() => {
    ref.current?.clearSignature();
    setHasStrokes(false);
    onChange(null);
    onEnd?.();
  }, [onChange, onEnd]);

  const handleSignAgain = useCallback(() => {
    onChange(null);
    setHasStrokes(false);
    onEnd?.();
  }, [onChange, onEnd]);

  const handleBegin = useCallback(() => {
    setHasStrokes(true);
    onBegin?.();
  }, [onBegin]);

  const handleEnd = useCallback(() => {
    onEnd?.();
  }, [onEnd]);

  // The canvas lives inside a WebView, so it is styled with CSS rather than
  // StyleSheet. Hide the library's own footer — the buttons below are themed.
  const webStyle = `
    .m-signature-pad { box-shadow: none; border: none; margin: 0; touch-action: none; }
    .m-signature-pad--body { border: none; touch-action: none; }
    .m-signature-pad--body canvas { background-color: ${colors.surfaceContainerLow}; touch-action: none; }
    .m-signature-pad--footer { display: none; }
    body, html { height: 100%; margin: 0; background-color: ${colors.surfaceContainerLow}; touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; overflow: hidden; }
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View style={styles.previewWrapper}>
          <Image
            source={{ uri: value }}
            style={styles.preview}
            resizeMode="contain"
            accessibilityLabel="Your signature"
          />
          <TouchableOpacity style={styles.signAgain} onPress={handleSignAgain}>
            <MaterialIcons name="edit" size={18} color={colors.primaryBright} />
            <Text style={styles.signAgainText}>Sign again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.padWrapper}>
            <SignatureScreen
              ref={ref}
              onOK={handleOK}
              onBegin={handleBegin}
              onEnd={handleEnd}
              onEmpty={() => setHasStrokes(false)}
              webStyle={webStyle}
              backgroundColor={colors.surfaceContainerLow}
              penColor={colors.onSurface}
              descriptionText=""
              autoClear={false}
              nestedScrollEnabled={true}
            />
            {!hasStrokes && (
              // pointerEvents none so the hint never intercepts a stroke.
              <View pointerEvents="none" style={styles.hint}>
                <MaterialIcons
                  name="gesture"
                  size={22}
                  color={colors.onSurfaceVariant}
                />
                <Text style={styles.hintText}>Sign with your finger</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={handleClear}>
              <Text style={styles.actionText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.action, styles.actionPrimary, !hasStrokes && styles.actionDisabled]}
              onPress={handleDone}
              disabled={!hasStrokes}
            >
              <Text style={[styles.actionText, styles.actionPrimaryText]}>
                Use this signature
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: theme.typography.letterSpacing.widest,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.xs,
    },
    padWrapper: {
      height: PAD_HEIGHT,
      borderRadius: theme.borderRadius.xl,
      overflow: "hidden",
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderStyle: "dashed",
    },
    hint: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    hintText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.base,
      marginTop: theme.spacing.base,
    },
    action: {
      flex: 1,
      height: 44,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainer,
    },
    actionPrimary: {
      backgroundColor: colors.primary,
    },
    actionDisabled: {
      opacity: 0.5,
    },
    actionText: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    actionPrimaryText: {
      color: colors.onPrimary,
    },
    previewWrapper: {
      borderRadius: theme.borderRadius.xl,
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: theme.spacing.base,
      alignItems: "center",
      gap: theme.spacing.base,
    },
    preview: {
      width: "100%",
      height: 120,
    },
    signAgain: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    signAgainText: {
      fontFamily: font("body", "bold"),
      fontSize: theme.typography.size.sm,
      color: colors.primaryBright,
    },
    helper: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.xs,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    error: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.xs,
      color: colors.error,
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
  });

export default SignaturePad;
