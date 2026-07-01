// Elevation — Blue Cobalt Archive Design System
//
// Discipline: default surfaces are `flat` (hairline border) or `raised`
// (soft neutral shadow). The cobalt glow is a privilege — at most two glow
// surfaces per screen: the hero money card and the primary CTA.

import type { ViewStyle } from 'react-native';
import type { Palette } from './colors';

export const createElevation = (colors: Palette) =>
  ({
    // Hairline-bordered card, no shadow — the default resting surface
    flat: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    // Soft neutral shadow for surfaces that need lift (menus, sticky bars)
    raised: {
      shadowColor: colors.ambientShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
    // Cobalt glow — hero surfaces and primary CTAs only
    glowMd: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    glowLg: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
  }) satisfies Record<string, ViewStyle>;

export type Elevation = ReturnType<typeof createElevation>;
