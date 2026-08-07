import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, ThemePreference, lightColors, darkColors } from "@/contexts/ThemeContext";
import { theme as themeConfig } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ThemeOptionProps {
  theme: ThemePreference;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const ThemePreview: React.FC<{ theme: ThemePreference }> = ({ theme }) => {
  if (theme === "light") {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.lightPreviewBg}>
          <View style={styles.previewHeader}>
            <View style={styles.previewAvatar} />
            <View style={styles.previewLine} />
          </View>
          <View style={styles.previewCards}>
            <View style={styles.previewCardSmall} />
            <View style={styles.previewCardLarge} />
          </View>
        </View>
      </View>
    );
  }

  if (theme === "dark") {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.darkPreviewBg}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewAvatar, styles.darkPreviewAvatar]} />
            <View style={[styles.previewLine, styles.darkPreviewLine]} />
          </View>
          <View style={styles.previewCards}>
            <View style={[styles.previewCardSmall, styles.darkPreviewCard]} />
            <View style={[styles.previewCardLarge, styles.darkPreviewCardBlue]} />
          </View>
        </View>
      </View>
    );
  }

  // System default - split view
  return (
    <View style={styles.previewContainer}>
      <View style={styles.systemPreviewContainer}>
        <View style={styles.systemPreviewLight}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewAvatar, { width: 24, height: 24 }]} />
            <View style={[styles.previewLine, { width: 48, height: 6 }]} />
          </View>
          <View style={[styles.previewCardSmall, { width: "100%", marginTop: 8 }]} />
        </View>
        <View style={styles.systemPreviewDark}>
          <View style={styles.previewHeader}>
            <View
              style={[
                styles.previewAvatar,
                styles.darkPreviewAvatar,
                { width: 24, height: 24 },
              ]}
            />
            <View
              style={[
                styles.previewLine,
                styles.darkPreviewLine,
                { width: 48, height: 6 },
              ]}
            />
          </View>
          <View
            style={[
              styles.previewCardSmall,
              styles.darkPreviewCard,
              { width: "100%", marginTop: 8 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const ThemeOption: React.FC<ThemeOptionProps> = ({
  theme,
  title,
  description,
  isSelected,
  onSelect,
  index,
}) => {
  const { colors } = useTheme();
  const elevations = createElevation(colors);

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(200 + index * 100).duration(400)}
      onPress={onSelect}
      style={[
        styles.themeCard,
        isSelected ? elevations.raised : elevations.flat,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: isSelected ? colors.primary : colors.outlineVariant,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.themeCardHeader}>
        <View>
          <Text style={[styles.themeTitle, { color: colors.onSurface }]}>{title}</Text>
          <Text style={[styles.themeDescription, { color: colors.onSurfaceVariant }]}>
            {description}
          </Text>
        </View>
        <View
          style={[
            styles.radioButton,
            {
              borderColor: isSelected ? colors.primary : colors.outline,
            },
          ]}
        >
          {isSelected && (
            <View
              style={[styles.radioButtonInner, { backgroundColor: colors.primary }]}
            />
          )}
        </View>
      </View>

      <ThemePreview theme={theme} />

      {isSelected && (
        <View
          style={[styles.selectedOverlay, { backgroundColor: `${colors.primary}08` }]}
        />
      )}
    </AnimatedTouchable>
  );
};

export default function ThemePreferenceScreen() {
  const router = useRouter();
  const { theme, setTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const elevations = createElevation(colors);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <ScreenHeader title="Theme Preference" onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.titleContainer}
        >
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Personalize your experience
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Choose a visual style that matches your workflow and environment.
          </Text>
        </Animated.View>

        {/* Theme Options */}
        <View style={styles.themeOptionsContainer}>
          <ThemeOption
            theme="light"
            title="Light Mode"
            description="Clean and crisp for bright environments"
            isSelected={theme === "light"}
            onSelect={() => setTheme("light")}
            index={0}
          />

          <ThemeOption
            theme="dark"
            title="Dark Mode"
            description="Easier on the eyes in low-light settings"
            isSelected={theme === "dark"}
            onSelect={() => setTheme("dark")}
            index={1}
          />

          <ThemeOption
            theme="system"
            title="System Default"
            description="Synchronize with your device's settings"
            isSelected={theme === "system"}
            onSelect={() => setTheme("system")}
            index={2}
          />
        </View>

        {/* Info Card */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={[
            styles.infoCard,
            {
              backgroundColor: `${colors.primary}08`,
              borderColor: `${colors.primary}10`,
            },
          ]}
        >
          <View style={[styles.infoIcon, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="palette" size={28} color={colors.onPrimary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.onSurface }]}>
              Did you know?
            </Text>
            <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
              Switching to Dark Mode can save up to 30% battery on OLED screens and
              reduces eye strain during night shifts.
            </Text>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Save Button */}
      <View
        style={[
          styles.fixedButtonContainer,
          elevations.raised,
          {
            backgroundColor: colors.background,
            paddingBottom:
              Math.max(insets.bottom, themeConfig.spacing.lg) + themeConfig.spacing.lg,
          },
        ]}
      >
        <Button
          title="Save Preferences"
          onPress={handleSave}
          variant="primary"
          size="lg"
          icon="check-circle"
          iconPosition="left"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: themeConfig.spacing.lg,
  },
  titleContainer: {
    marginBottom: themeConfig.spacing.lg,
  },
  title: {
    ...typography.styles.screenTitle,
    marginBottom: themeConfig.spacing.xs,
  },
  subtitle: {
    ...typography.styles.bodyText,
    fontSize: typography.size.sm,
  },
  themeOptionsContainer: {
    gap: themeConfig.spacing.base,
  },
  themeCard: {
    borderRadius: themeConfig.borderRadius.xl,
    padding: themeConfig.spacing.lg,
    overflow: "hidden",
  },
  themeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: themeConfig.spacing.lg,
  },
  themeTitle: {
    ...typography.styles.cardTitle,
    fontSize: typography.size.lg,
    marginBottom: 4,
  },
  themeDescription: {
    ...typography.styles.bodyText,
    fontSize: typography.size.sm,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    height: 128,
    borderRadius: themeConfig.borderRadius.lg,
    overflow: "hidden",
  },
  lightPreviewBg: {
    flex: 1,
    backgroundColor: lightColors.background,
    padding: 12,
    gap: 8,
  },
  darkPreviewBg: {
    flex: 1,
    backgroundColor: darkColors.background,
    padding: 12,
    gap: 8,
  },
  systemPreviewContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: themeConfig.borderRadius.lg,
    overflow: "hidden",
  },
  systemPreviewLight: {
    flex: 1,
    backgroundColor: lightColors.background,
    padding: 12,
  },
  systemPreviewDark: {
    flex: 1,
    backgroundColor: darkColors.background,
    padding: 12,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightColors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkPreviewAvatar: {
    backgroundColor: darkColors.surfaceContainerHigh,
  },
  previewLine: {
    width: 96,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightColors.outlineVariant,
  },
  darkPreviewLine: {
    backgroundColor: darkColors.surfaceContainerHighest,
  },
  previewCards: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  previewCardSmall: {
    width: "33%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: lightColors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewCardLarge: {
    width: "67%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: lightColors.primaryFixed,
  },
  darkPreviewCard: {
    backgroundColor: darkColors.surfaceContainerHigh,
  },
  darkPreviewCardBlue: {
    backgroundColor: darkColors.cobaltGlow,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: themeConfig.spacing.base,
    borderRadius: themeConfig.borderRadius.xl,
    padding: themeConfig.spacing.lg,
    marginTop: themeConfig.spacing["2xl"],
    borderWidth: 1,
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...typography.styles.cardTitle,
    fontSize: typography.size.base,
    marginBottom: 4,
  },
  infoText: {
    ...typography.styles.bodyText,
    fontSize: typography.size.sm,
  },
  bottomPadding: {
    height: 100,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: themeConfig.spacing.lg,
    paddingTop: themeConfig.spacing["2xl"],
  },
});
