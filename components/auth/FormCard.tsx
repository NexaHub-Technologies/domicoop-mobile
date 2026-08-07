import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme , lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { createElevation } from '@/constants/theme';

type FormCardColors = typeof lightColors;

interface FormCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  spacing?: 'sm' | 'md' | 'lg';
  overlap?: boolean;
}

export const FormCard: React.FC<FormCardProps> = ({
  children,
  style,
  spacing = 'md',
  overlap = false,
}) => {
  const { colors } = useTheme();
  const elevations = createElevation(colors);
  const styles = createStyles(colors, elevations);

  const getSpacing = () => {
    switch (spacing) {
      case 'sm':
        return theme.spacing.lg;
      case 'lg':
        return theme.spacing['2xl'];
      case 'md':
      default:
        return theme.spacing.xl;
    }
  };

  return (
    <View style={[
      styles.container,
      { padding: getSpacing() },
      overlap && styles.overlap,
      style,
    ]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const createStyles = (
  colors: FormCardColors,
  elevations: ReturnType<typeof createElevation>,
) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    ...elevations.raised,
  },
  overlap: {
    marginTop: -32,
  },
  content: {
    gap: theme.spacing.lg,
  },
});
