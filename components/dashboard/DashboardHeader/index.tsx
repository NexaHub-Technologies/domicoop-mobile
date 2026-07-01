import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/data/mockData";
import { Skeleton } from "@/components/common/Skeleton";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      marginRight: theme.spacing.base,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 2,
      borderColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarText: {
      ...typography.styles.headline,
      fontSize: typography.size.md,
      color: colors.primaryBright,
    },
    textContainer: {
      marginLeft: theme.spacing.xs,
    },
    welcomeText: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      lineHeight: 16,
    },
    nameText: {
      ...typography.styles.headline,
      fontSize: typography.size.base,
      color: colors.onSurface,
      lineHeight: 20,
    },
    notificationButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: colors.surfaceContainer,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export const DashboardHeader: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { data: profile, isPending } = useProfile();
  const isLoading = isPending;
  const userName = profile?.full_name || "User";

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {/* Avatar with Initials */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {isLoading ? "" : getInitials(userName)}
              </Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            {isLoading ? (
              <Skeleton variant="text" width={120} height={14} />
            ) : (
              <Text style={styles.nameText}>{userName}</Text>
            )}
          </View>
        </View>

        {/* Notifications Button */}
        <AnimatedTouchable
          onPress={handleNotificationsPress}
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="notifications" size={24} color={colors.onSurfaceVariant} />
        </AnimatedTouchable>
      </View>
    </Animated.View>
  );
};

export default DashboardHeader;
