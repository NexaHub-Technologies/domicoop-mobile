// Typography — Blue Cobalt Archive Design System
//
// Display face: Plus Jakarta Sans (titles, money figures)
// Body face:    Inter (everything else)
//
// Fonts are embedded natively via the expo-font config plugin (app.config.js).
// Each weight is its own font file, and on Android a custom `fontFamily` does
// NOT respond to `fontWeight` — so always resolve the exact weight-specific
// family name via `font()` (or use a preset from `typography.styles`), and do
// not set `fontWeight` alongside it.

const displayFamilies = {
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
} as const;

const bodyFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export type DisplayWeight = keyof typeof displayFamilies;
export type BodyWeight = keyof typeof bodyFamilies;

export function font(family: 'display', weight: DisplayWeight): string;
export function font(family: 'body', weight: BodyWeight): string;
export function font(
  family: 'display' | 'body',
  weight: DisplayWeight | BodyWeight,
): string {
  return family === 'display'
    ? displayFamilies[weight as DisplayWeight]
    : bodyFamilies[weight as BodyWeight];
}

export const typography = {
  // Font Families (legacy keys — prefer font() or the presets below)
  fontFamily: {
    headline: displayFamilies.bold,
    body: bodyFamilies.regular,
    label: bodyFamilies.regular,
  },

  // Font Weights (iOS-only effect with custom fonts; Android ignores it —
  // kept for legacy call sites until they migrate to presets)
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Font Sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 36,
    '5xl': 40,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },

  // Predefined text styles — the exact family carries the weight
  styles: {
    // Legacy presets (unsized, family-only)
    headline: {
      fontFamily: displayFamilies.bold,
    },
    headlineExtrabold: {
      fontFamily: displayFamilies.extrabold,
      letterSpacing: -0.5,
    },
    body: {
      fontFamily: bodyFamilies.regular,
    },
    bodyMedium: {
      fontFamily: bodyFamilies.medium,
    },
    label: {
      fontFamily: bodyFamilies.semibold,
    },
    labelBold: {
      fontFamily: bodyFamilies.bold,
    },

    // Sized semantic presets — use these on restyled screens
    displayLarge: {
      fontFamily: displayFamilies.extrabold,
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.5,
    },
    screenTitle: {
      fontFamily: displayFamilies.bold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.5,
    },
    cardTitle: {
      fontFamily: displayFamilies.bold,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.25,
    },
    sectionLabel: {
      fontFamily: bodyFamilies.semibold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    bodyText: {
      fontFamily: bodyFamilies.regular,
      fontSize: 14,
      lineHeight: 21,
    },
    bodySmall: {
      fontFamily: bodyFamilies.regular,
      fontSize: 12,
      lineHeight: 18,
    },
    caption: {
      fontFamily: bodyFamilies.medium,
      fontSize: 11,
      lineHeight: 14,
    },
  },
} as const;

export type Typography = typeof typography;
