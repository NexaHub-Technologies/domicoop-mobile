import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme , lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';

type BackButtonColors = typeof lightColors;

interface BackButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  icon = 'arrow-back',
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
};

const createStyles = (colors: BackButtonColors) => StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${colors.surface}50`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
