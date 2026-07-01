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
import { loanPurposes, LoanPurpose, LoanPurposeConfig } from "@/data/mockData";

type PurposeColors = typeof lightColors;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PurposeItemProps {
  purpose: LoanPurposeConfig;
  isSelected: boolean;
  onPress: () => void;
  colors: PurposeColors;
}

const PurposeItem: React.FC<PurposeItemProps> = ({
  purpose,
  isSelected,
  onPress,
  colors,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const styles = createStyles(colors);

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.item,
        {
          backgroundColor: isSelected ? purpose.bgColor : colors.surface,
          borderColor: isSelected ? purpose.color : colors.outlineVariant,
        },
        animatedStyle,
      ]}
      activeOpacity={0.8}
    >
      <MaterialIcons
        name={purpose.icon as any}
        size={28}
        color={isSelected ? purpose.color : colors.onSurfaceVariant}
      />
      <Text
        style={[
          styles.itemLabel,
          { color: isSelected ? purpose.color : colors.onSurface },
        ]}
      >
        {purpose.label}
      </Text>
    </AnimatedTouchable>
  );
};

interface PurposeSelectorProps {
  selectedPurpose: LoanPurpose | null;
  onSelectPurpose: (purpose: LoanPurpose) => void;
}

export const PurposeSelector: React.FC<PurposeSelectorProps> = ({
  selectedPurpose,
  onSelectPurpose,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Purpose of Loan</Text>
      <View style={styles.grid}>
        {loanPurposes.map((purpose) => (
          <PurposeItem
            key={purpose.id}
            purpose={purpose}
            isSelected={selectedPurpose === purpose.id}
            onPress={() => onSelectPurpose(purpose.id)}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: PurposeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    item: {
      width: "18%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      padding: theme.spacing.xs,
    },
    itemLabel: {
      fontFamily: font("body", "bold"),
      fontSize: typography.size.xs - 2,
      marginTop: 4,
      textAlign: "center",
    },
  });

export default PurposeSelector;
