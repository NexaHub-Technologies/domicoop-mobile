import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type SummaryCardsColors = typeof lightColors;

interface SummaryCardsProps {
  unreadCount: number;
  /** Relative time of the latest notification, e.g. "15m ago" */
  latestActivity?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  unreadCount,
  latestActivity,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.unreadCard}
      >
        <View style={styles.unreadContent}>
          <Text style={styles.unreadLabel}>Unread Alerts</Text>
          <Text style={styles.unreadCount}>
            {unreadCount > 0 ? `${unreadCount} New` : "All caught up"}
          </Text>
          <Text style={styles.unreadSubtitle}>
            {latestActivity
              ? `Latest update ${latestActivity}`
              : "Updates from your cooperative appear here."}
          </Text>
        </View>
        <View style={styles.watermarkContainer}>
          <MaterialIcons
            name="notifications"
            size={100}
            color={`${colors.onPrimary}1A`}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: SummaryCardsColors) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    unreadCard: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      overflow: "hidden",
      position: "relative",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    unreadContent: {
      zIndex: 1,
    },
    unreadLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}80`,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 4,
    },
    unreadCount: {
      fontFamily: font("display", "extrabold"),
      fontSize: typography.size["2xl"],
      color: colors.onPrimary,
      marginBottom: 4,
    },
    unreadSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: `${colors.onPrimary}B3`,
    },
    watermarkContainer: {
      position: "absolute",
      bottom: -16,
      right: -16,
      zIndex: 0,
    },
  });

export default SummaryCards;
