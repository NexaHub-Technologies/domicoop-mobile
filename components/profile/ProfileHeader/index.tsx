import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import type { Profile } from "@/lib/types/sign-up";
import { getInitials, formatDate } from "@/lib/utils/format";

interface ProfileHeaderProps {
  profile: Profile | null;
  isLoading?: boolean;
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 2,
      borderColor: colors.primaryBright,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.primaryBright,
    },
    infoContainer: {
      flex: 1,
    },
    name: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    memberBadge: {
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    memberBadgeText: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.xs,
      color: colors.primary,
    },
    memberSince: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    loadingContainer: {
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
    },
  });

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isLoading }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (isLoading || !profile) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <ScreenHeader title="Profile" large />

        {/* Loading State */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </Animated.View>
    );
  }

  const initials = getInitials(profile.full_name);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <ScreenHeader title="Profile" large />

      {/* Profile Info — compact identity row */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.profileRow}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.full_name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>
                Member ID: {profile.member_no || "Pending"}
              </Text>
            </View>
            <Text style={styles.memberSince}>
              Since {formatDate(profile.created_at)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ProfileHeader;
