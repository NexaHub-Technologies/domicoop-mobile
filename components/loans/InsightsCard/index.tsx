import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { loanInsights } from "@/constants/loans";

const AnimatedView = Animated.createAnimatedComponent(View);

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.base,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.outline}30`,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      marginBottom: 4,
    },
    description: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
  });

export const InsightsCard: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Get a random insight
  const randomInsight = loanInsights[Math.floor(Math.random() * loanInsights.length)];

  return (
    <AnimatedView entering={FadeInUp.delay(600).duration(400)} style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Did you know?</Text>
        <Text style={styles.description}>{randomInsight}</Text>
      </View>
    </AnimatedView>
  );
};

export default InsightsCard;
