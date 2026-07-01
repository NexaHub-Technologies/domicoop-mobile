import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
  getNotificationIcon,
  getNotificationIconBg,
  getNotificationIconColor,
  getRelativeTime,
} from "@/data/mockData";

type NotificationCardColors = typeof lightColors;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleActionPress = () => {
    if (notification.action) {
      router.push(notification.action.route as any);
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const iconName = getNotificationIcon(notification.type);
  const iconBg = getNotificationIconBg(notification.type);
  const iconColor = getNotificationIconColor(notification.type);
  const relativeTime = getRelativeTime(notification.timestamp);

  return (
    <AnimatedTouchable
      onPress={handlePress}
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
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={iconName as any} size={24} color={iconColor} />
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
          {notification.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionPress}
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
      borderLeftColor: colors.primary,
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
