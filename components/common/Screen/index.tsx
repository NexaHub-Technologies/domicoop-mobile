import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";

interface ScreenProps {
  children: React.ReactNode;
  /** Render children inside a ScrollView */
  scroll?: boolean;
  /** Apply horizontal screen padding */
  padded?: boolean;
  /** Safe-area edges to inset; bottom is left to tab bars / pinned CTAs */
  edges?: Edge[];
  /** Wrap content in a KeyboardAvoidingView (form screens) */
  keyboardAware?: boolean;
  /** Fixed header rendered above the scrollable content */
  header?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  padded = true,
  edges = ["top"],
  keyboardAware = false,
  header,
  style,
  contentContainerStyle,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        padded && styles.padded,
        styles.scrollContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      {header}
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    padded: {
      paddingHorizontal: theme.spacing.xl,
    },
    scrollContent: {
      paddingBottom: theme.spacing["4xl"],
    },
  });
