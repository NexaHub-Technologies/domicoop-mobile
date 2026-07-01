import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import type { Profile } from "@/lib/types/sign-up";
import { getInitials, formatDate } from "@/data/mockData";

interface ProfileHeaderProps {
  profile: Profile | null;
  isLoading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    navBar: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.base,
    },
    navContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    navTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
      flex: 1,
      textAlign: "center",
    },
    profileContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing["2xl"],
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    avatarContainer: {
      position: "relative",
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      borderWidth: 4,
      borderColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size["3xl"],
      color: colors.onPrimary,
    },
    editIconContainer: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
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
    infoContainer: {
      alignItems: "center",
    },
    name: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size["2xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.base,
    },
    badgeContainer: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    memberBadge: {
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    memberBadgeText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: colors.primary,
    },
    memberSince: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
    },
    loadingContainer: {
      paddingVertical: theme.spacing["3xl"],
      alignItems: "center",
    },
  });

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isLoading }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleEditAvatarPress = () => {
    // Handle avatar edit
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (isLoading || !profile) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.navBar}>
          <View style={styles.navContent}>
            <View style={styles.backButton} />
            <Text style={styles.navTitle}>Profile</Text>
            <View style={styles.backButton} />
          </View>
        </View>

        {/* Loading State */}
        <View style={styles.profileContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </Animated.View>
    );
  }

  const initials = getInitials(profile.full_name);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.navBar}>
        <View style={styles.navContent}>
          <View style={styles.backButton} />
          <Text style={styles.navTitle}>Profile</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarSection}>
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <AnimatedTouchable
              onPress={handleEditAvatarPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.avatarContainer, animatedStyle]}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              {/* Edit Icon */}
              <View style={styles.editIconContainer}>
                <MaterialIcons name="edit" size={14} color={colors.onPrimary} />
              </View>
            </AnimatedTouchable>
          </Animated.View>
        </View>

        {/* Name and Info */}
        <Animated.View
          entering={FadeInUp.delay(150).duration(400)}
          style={styles.infoContainer}
        >
          <Text style={styles.name}>{profile.full_name}</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>
                Member ID: {profile.member_no || "Pending"}
              </Text>
            </View>
            <Text style={styles.memberSince}>Member since {formatDate(profile.created_at)}</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default ProfileHeader;
