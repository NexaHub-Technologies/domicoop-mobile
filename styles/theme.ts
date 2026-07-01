// Thin aggregate over constants/theme — kept for the many existing
// `import { theme } from '@/styles/theme'` call sites.
//
// `theme.shadows` is deprecated: it is a neutral raised-shadow set kept for
// unmigrated screens. New/restyled code should use createElevation(colors)
// from constants/theme (flat / raised / glowMd / glowLg) so elevation is
// theme-aware and the cobalt glow stays a deliberate choice.

import { typography } from '../constants/theme/typography';
import { spacing, borderRadius } from '../constants/theme/layout';

export const theme = {
  typography,
  spacing,
  borderRadius,
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 12,
    },
  },
} as const;

export type Theme = typeof theme;
