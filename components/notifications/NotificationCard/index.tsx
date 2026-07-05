import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import {
  Notification,
  NotificationType,
  getRelativeTime,
} from "@/lib/types/notifications";

type NotificationCardColors = typeof lightColors;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TYPE_ICONS: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  loan: "account-balance-wallet",
  contribution: "calendar-month",
  dividend: "campaign",
  security: "security",
  meeting: "groups",
  announcement: "campaign",
};

const getTypeTint = (
  type: NotificationType,
  colors: NotificationCardColors,
): { bg: string; fg: string } => {
  switch (type) {
    case "loan":
      return { bg: colors.infoContainer, fg: colors.info };
    case "contribution":
      return { bg: colors.warningContainer, fg: colors.warning };
    case "security":
      return { bg: colors.errorContainer, fg: colors.error };
    case "meeting":
      return { bg: colors.infoContainer, fg: colors.info };
    case "dividend":
      return { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant };
    case "announcement":
      return { bg: colors.primaryContainer, fg: colors.primary };
  }
};

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onActionPress?: (route: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onActionPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const tint = getTypeTint(notification.type, colors);
  const relativeTime = getRelativeTime(notification.timestamp);

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer,
        animatedStyle,
        notification.isRead && styles.readContainer,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: tint.bg }]}>
          <MaterialIcons
            name={TYPE_ICONS[notification.type]}
            size={24}
            color={tint.fg}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, notification.isRead && styles.readText]}>
              {notification.title}
            </Text>
            <Text style={styles.timestamp}>{relativeTime}</Text>
          </View>
          <Text
            style={[styles.message, notification.isRead && styles.readText]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          {notification.action && onActionPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onActionPress(notification.action!.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>{notification.action.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const createStyles = (colors: NotificationCardColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.base,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    unreadContainer: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primaryBright,
    },
    readContainer: {
      opacity: 0.6,
      backgroundColor: `${colors.surface}90`,
    },
    content: {
      flexDirection: "row",
      gap: theme.spacing.base,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    textContainer: {
      flex: 1,
      gap: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    title: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    readText: {
      fontFamily: font("body", "semibold"),
    },
    timestamp: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    message: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.lg,
      alignSelf: "flex-start",
      marginTop: theme.spacing.xs,
    },
    actionButtonText: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs,
      color: colors.onPrimary,
    },
  });

export default NotificationCard;
