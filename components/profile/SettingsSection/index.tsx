import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import {
  profileSettings,
  SettingsItem as SettingsItemType,
  SettingsSection as SettingsSectionType,
} from "@/constants/profile";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing["2xl"],
    },
    sectionTitle: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionContent: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      marginHorizontal: theme.spacing.lg,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
      overflow: "hidden",
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.base,
    },
    destructiveIconContainer: {
      backgroundColor: colors.errorContainer,
    },
    textContainer: {
      flex: 1,
    },
    itemTitle: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.base,
      color: colors.onSurface,
      marginBottom: 2,
    },
    itemSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    destructiveText: {
      color: colors.error,
    },
  });

interface SettingsItemProps {
  item: SettingsItemType;
  index: number;
  sectionIndex: number;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  item,
  index,
  sectionIndex,
  onLogout,
  onDeleteAccount,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (item.route === "/logout" && onLogout) {
      onLogout();
    } else if (item.route === "/delete-account" && onDeleteAccount) {
      onDeleteAccount();
    } else {
      router.push(item.route as any);
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isLastItem = index === profileSettings[sectionIndex].items.length - 1;

  return (
    <Animated.View entering={FadeInUp.delay(300 + sectionIndex * 100 + index * 50).duration(300)}>
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.item, !isLastItem && styles.itemBorder, animatedStyle]}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            item.destructive && styles.destructiveIconContainer,
          ]}
        >
          <MaterialIcons
            name={item.icon as any}
            size={24}
            color={item.destructive ? colors.error : colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, item.destructive && styles.destructiveText]}>
            {item.title}
          </Text>
          {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={item.destructive ? colors.error : colors.outline}
        />
      </AnimatedTouchable>
    </Animated.View>
  );
};

interface SettingsSectionComponentProps {
  section: SettingsSectionType;
  sectionIndex: number;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

const SettingsSectionComponent: React.FC<SettingsSectionComponentProps> = ({
  section,
  sectionIndex,
  onLogout,
  onDeleteAccount,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Animated.Text
        entering={FadeInUp.delay(200 + sectionIndex * 100).duration(300)}
        style={styles.sectionTitle}
      >
        {section.title}
      </Animated.Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <SettingsItem
            key={item.id}
            item={item}
            index={index}
            sectionIndex={sectionIndex}
            onLogout={onLogout}
            onDeleteAccount={onDeleteAccount}
          />
        ))}
      </View>
    </View>
  );
};

interface SettingsSectionProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  onLogout,
  onDeleteAccount,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      {profileSettings.map((section, index) => (
        <SettingsSectionComponent
          key={section.id}
          section={section}
          sectionIndex={index}
          onLogout={onLogout}
          onDeleteAccount={onDeleteAccount}
        />
      ))}
    </View>
  );
};

export default SettingsSection;
