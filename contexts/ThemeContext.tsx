import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '@/constants/theme/colors';

// Re-exported for the many `createStyles(colors: typeof lightColors)` call
// sites; the palettes themselves live in constants/theme/colors.ts.
export { lightColors, darkColors };

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  isDarkMode: boolean;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  isDarkMode: false,
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@domicoop_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>('light');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  // Determine if dark mode is active
  const isDarkMode = React.useMemo(() => {
    if (theme === 'system') {
      return systemColorScheme === 'dark';
    }
    return theme === 'dark';
  }, [theme, systemColorScheme]);

  // Get current colors based on mode
  const colors = React.useMemo(() => {
    return isDarkMode ? darkColors : lightColors;
  }, [isDarkMode]);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ThemePreference);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Apply theme to system UI
  useEffect(() => {
    const applySystemUI = async () => {
      try {
        // Set background color
        await SystemUI.setBackgroundColorAsync(colors.background);
      } catch (error) {
        console.error('Error applying system UI:', error);
      }
    };
    
    if (!isLoading) {
      applySystemUI();
    }
  }, [colors.background, isLoading]);

  // Save theme when changed
  const setTheme = async (newTheme: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
