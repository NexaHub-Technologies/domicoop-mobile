// Blue Cobalt Archive — single source of truth for both palettes.
// Consumed at runtime via ThemeContext's useTheme(); do not import palettes
// directly into components except for typing (`typeof lightColors`).

// Light Mode Colors - Blue Cobalt Archive
export const lightColors = {
  // Background & Surface
  background: '#f5f6f8',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f9fc',
  surfaceContainer: '#f1f3f9',
  surfaceContainerHigh: '#e9edf6',
  surfaceContainerHighest: '#e2e7f3',
  surfaceBright: '#ffffff',
  surfaceDim: '#f5f6f8',

  // Primary - Blue Cobalt
  primary: '#0b50da',
  primaryContainer: '#0b50da',
  onPrimary: '#ffffff',
  primaryFixed: '#dce1ff',
  primaryFixedDim: '#b5c4ff',
  onPrimaryFixed: '#00164d',
  onPrimaryFixedVariant: '#003cad',
  // Interactive/text accent; diverges from `primary` only in dark mode,
  // where #1e55be fails contrast against the dark background.
  primaryBright: '#0b50da',

  // Secondary
  secondary: '#475569',
  secondaryContainer: '#f1f5f9',
  onSecondary: '#ffffff',
  secondaryFixed: '#e2e8f0',
  secondaryFixedDim: '#cbd5e1',
  onSecondaryFixed: '#0f172a',
  onSecondaryFixedVariant: '#334155',

  // Tertiary - Orange (loans accent — not a status color)
  tertiary: '#ea580c',
  tertiaryContainer: '#ffedd5',
  onTertiary: '#ffffff',
  tertiaryFixed: '#ffdbd0',
  tertiaryFixedDim: '#ffb59e',
  onTertiaryFixed: '#3a0b00',
  onTertiaryFixedVariant: '#842500',

  // Text
  onSurface: '#0f172a',
  onSurfaceVariant: '#475569',
  onBackground: '#0f172a',

  // Outline
  outline: '#cbd5e1',
  outlineVariant: '#e2e8f0',

  // Error
  error: '#ef4444',
  errorContainer: '#fee2e2',
  onError: '#ffffff',
  onErrorContainer: '#991b1b',

  // Success
  success: '#22c55e',
  successContainer: '#dcfce7',
  onSuccess: '#ffffff',
  onSuccessContainer: '#14532d',

  // Warning
  warning: '#f59e0b',
  warningContainer: '#fef3c7',
  onWarning: '#ffffff',
  onWarningContainer: '#92400e',

  // Info (cobalt-tinted)
  info: '#0b50da',
  infoContainer: '#dce1ff',
  onInfo: '#ffffff',
  onInfoContainer: '#00164d',

  // Inverse
  inverseSurface: '#1e293b',
  inverseOnSurface: '#f1f5f9',
  inversePrimary: '#b5c4ff',

  // Glow & Effects
  cobaltGlow: 'rgba(11, 80, 218, 0.4)',
  ambientShadow: 'rgba(0, 0, 0, 0.1)',
  scrim: 'rgba(2, 6, 23, 0.55)',

  // The one brand gradient — hero surfaces only (dashboard balance card,
  // auth hero, success screen). Nothing else gets a gradient.
  brandGradient: ['#0b50da', '#003cad'] as [string, string],
};

// Dark Mode Colors - Nocturnal Cobalt (see DESIGN.md)
export const darkColors = {
  // Background & Surface - The Luminescent Archive
  background: '#0b1326',           // The void - absolute base
  surface: '#0b1326',              // Same as background
  surfaceContainerLowest: '#060e20', // Recessed content
  surfaceContainerLow: '#0f172a',    // Card body
  surfaceContainer: '#171f33',       // Standard cards
  surfaceContainerHigh: '#1e293b',   // Elevated overlays
  surfaceContainerHighest: '#31394d', // Bright overlays
  surfaceBright: '#31394d',
  surfaceDim: '#0b1326',

  // Primary - Cobalt Pulse
  primary: '#1e55be',              // Main accent (filled surfaces)
  primaryContainer: '#b2c5ff',     // For gradients
  onPrimary: '#ffffff',
  primaryFixed: '#dae2ff',
  primaryFixedDim: '#b2c5ff',
  onPrimaryFixed: '#001847',
  onPrimaryFixedVariant: '#0040a0',
  // #1e55be fails contrast on #0b1326 — use this for interactive text/icons.
  primaryBright: '#5b8bff',

  // Secondary
  secondary: '#4e5d87',
  secondaryContainer: '#becefd',
  onSecondary: '#ffffff',
  secondaryFixed: '#dae2ff',
  secondaryFixedDim: '#b6c5f5',
  onSecondaryFixed: '#071a3f',
  onSecondaryFixedVariant: '#36466d',

  // Tertiary - Warm accent (loans accent — not a status color)
  tertiary: '#ffb694',
  tertiaryContainer: '#ffdbcc',
  onTertiary: '#ffffff',
  tertiaryFixed: '#ffdbcc',
  tertiaryFixedDim: '#ffb694',
  onTertiaryFixed: '#351000',
  onTertiaryFixedVariant: '#7a2f00',

  // Text - No pure white (prevents eye strain)
  onSurface: '#dae2fd',            // Main text (not pure white)
  onSurfaceVariant: '#c3c6d5',     // Secondary text
  onBackground: '#dae2fd',

  // Outline - Ghost borders
  outline: '#737784',
  outlineVariant: '#434653',       // At 15% opacity

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Success
  success: '#4ade80',
  successContainer: '#14532d',
  onSuccess: '#0f172a',
  onSuccessContainer: '#dcfce7',

  // Warning
  warning: '#fbbf24',
  warningContainer: '#78350f',
  onWarning: '#451a03',
  onWarningContainer: '#fef3c7',

  // Info (cobalt-tinted)
  info: '#5b8bff',
  infoContainer: '#0f2a5e',
  onInfo: '#ffffff',
  onInfoContainer: '#dae2ff',

  // Inverse
  inverseSurface: '#2e3037',
  inverseOnSurface: '#f0f0f9',
  inversePrimary: '#b2c5ff',

  // Glow & Effects - Cobalt energy
  cobaltGlow: 'rgba(30, 85, 190, 0.4)',
  ambientShadow: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.7)',

  brandGradient: ['#0b50da', '#003cad'] as [string, string],
};

export type Palette = typeof lightColors;

// Compile-time guarantee that both palettes expose identical token names.
const _darkPaletteCheck: Palette = darkColors;
void _darkPaletteCheck;
