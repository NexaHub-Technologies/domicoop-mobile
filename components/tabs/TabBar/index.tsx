import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";

type TabBarColors = typeof lightColors;

interface TabItemProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tabItemBaseStyle = {
  flex: 1,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.sm,
  borderRadius: theme.borderRadius.xl,
  marginHorizontal: theme.spacing.xs,
};

const tabLabelBaseStyle = {
  ...typography.styles.label,
  fontSize: 7,
  marginTop: theme.spacing.xs,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
};

const TabItem: React.FC<TabItemProps & { colors: TabBarColors }> = ({
  label,
  iconName,
  isFocused,
  onPress,
  colors,
}) => {
  const handlePress = () => {
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      style={[
        tabItemBaseStyle,
        { backgroundColor: isFocused ? `${colors.primary}15` : "transparent" },
      ]}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={iconName}
        size={24}
        color={isFocused ? colors.primaryBright : colors.onSurfaceVariant}
      />
      <Animated.Text
        style={[
          tabLabelBaseStyle,
          { color: isFocused ? colors.primaryBright : colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedTouchable>
  );
};

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
  const getIconName = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
    switch (routeName) {
      case "index":
        return "home";
      case "loans":
        return "payments";
      case "contributions":
        return "account-balance-wallet";
      case "announcements":
        return "campaign";
      case "profile":
        return "person";
      default:
        return "circle";
    }
  };

  const getLabel = (routeName: string): string => {
    switch (routeName) {
      case "index":
        return "Home";
      case "loans":
        return "Loans";
      case "contributions":
        return "Contributions";
      case "announcements":
        return "Alerts";
      case "profile":
        return "Profile";
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              label={getLabel(route.name)}
              iconName={getIconName(route.name)}
              isFocused={isFocused}
              onPress={onPress}
              index={index}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: TabBarColors, bottomInset: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: theme.borderRadius["2xl"],
      borderTopRightRadius: theme.borderRadius["2xl"],
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
      paddingBottom: Math.max(
        bottomInset,
        Platform.OS === "ios" ? theme.spacing.lg : theme.spacing.md,
      ),
      paddingTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
    tabBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
  });

export default TabBar;
