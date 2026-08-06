import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { BackButton } from "@/components/auth/BackButton";
import { Button } from "@/components/common/Button";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { GUIDELINES } from "@/constants/guidelines";
import { onboarding } from "@/lib/onboarding";
import { session } from "@/lib/session";

export default function GuidelinesScreen() {
  const router = useRouter();
  const { context } = useLocalSearchParams<{ context?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const isOnboarding = context === "onboarding";
  const [agreed, setAgreed] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    onboarding.markGuidelinesSeen().catch(() => {});
    // Completing first-run onboarding also satisfies the every-login gate,
    // so the very next sign-in doesn't immediately re-prompt.
    session.acknowledgeGuidelines().catch(() => {});
    router.push("/welcome");
  };

  const renderGuideline = ({ item }: { item: (typeof GUIDELINES)[number] }) => (
    <View style={styles.guidelineItem}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{item.id}</Text>
      </View>
      <Text style={styles.guidelineText}>{item.text}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.screenTitle}>Cooperative Guidelines</Text>
      <Text style={styles.introText}>
        Good day our intending cooperator. You are welcome to Dominion
        Cooperative Society. Our office number is No. 75 Jack Novo Plaza, Water
        Resources, Effurun Sapele Road, Effurun.
      </Text>
      <Text style={styles.introSubtext}>
        In this cooperative we have some rules and regulations that govern the
        body. Few are outlined for the purpose of this meeting.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View
        style={[
          styles.topHeader,
          { top: insets.top + theme.spacing.lg },
        ]}
      >
        <BackButton onPress={handleBack} />
      </View>

      {/* Guidelines List */}
      <FlatList
        data={GUIDELINES}
        renderItem={renderGuideline}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Footer - only during onboarding */}
      {isOnboarding && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + theme.spacing["2xl"] },
          ]}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color={colors.onPrimary}
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the cooperative guidelines
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!agreed}
            icon="arrow-forward"
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topHeader: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 10,
    },
    listContent: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingBottom: theme.spacing.xl,
    },
    headerSection: {
      marginBottom: theme.spacing.xl,
    },
    screenTitle: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size["2xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.lg,
    },
    introText: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.base,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.base * theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing.base,
    },
    introSubtext: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    },
    guidelineItem: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      gap: theme.spacing.base,
      alignItems: "flex-start",
    },
    numberBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    numberText: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.onPrimary,
    },
    guidelineText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurface,
      lineHeight:
        theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    },
    footer: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingTop: theme.spacing.lg,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.outline,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLowest,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      flex: 1,
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
  });
