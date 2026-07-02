# DOMICOP Design System — Blue Cobalt Archive

The visual identity for DOMICOP: cobalt blue with disciplined restraint. Money
is the product, so figures are the loudest element on every screen; the brand
color is spent deliberately, not everywhere.

Token source of truth: **`constants/theme/`**
- `colors.ts` — `lightColors` / `darkColors` (the only palette definitions)
- `typography.ts` — families, sizes, presets, and the `font()` helper
- `layout.ts` — `spacing`, `borderRadius`
- `elevation.ts` — `createElevation(colors)` → `flat | raised | glowMd | glowLg`

Runtime access: `const { colors, isDarkMode } = useTheme()` from
`contexts/ThemeContext` (which re-exports the palettes for typing:
`createStyles(colors: typeof lightColors)`).

---

## Color

### Light — Blue Cobalt Archive

| Token | Value | Use |
|---|---|---|
| `primary` | `#0b50da` | Filled surfaces, CTAs |
| `primaryBright` | `#0b50da` | Interactive text/icons (same as primary in light) |
| `background` | `#f5f6f8` | Screen background |
| `surface` | `#ffffff` | Cards |
| `onSurface` | `#0f172a` | Main text |
| `onSurfaceVariant` | `#475569` | Secondary text |
| `tertiary` | `#ea580c` | **Loans accent only** — never a status color |
| `success` / container | `#22c55e` / `#dcfce7` | Verified, credits |
| `warning` / container | `#f59e0b` / `#fef3c7` | Pending |
| `error` / container | `#ef4444` / `#fee2e2` | Rejected, failures |
| `info` / container | `#0b50da` / `#dce1ff` | Informational |
| `scrim` | `rgba(2,6,23,0.55)` | Modal overlays |
| `brandGradient` | `#0b50da → #003cad` | Hero surfaces only |

### Dark — Nocturnal Cobalt

| Token | Value | Use |
|---|---|---|
| `primary` | `#1e55be` | Filled surfaces only (fails contrast as text) |
| `primaryBright` | `#5b8bff` | Interactive text/icons on dark |
| `background` / `surface` | `#0b1326` | The void |
| `surfaceContainer` | `#171f33` | Standard cards |
| `onSurface` | `#dae2fd` | Main text — **no pure white** (eye strain) |
| `onBackground` | `#dae2fd` | (was `#191b22` — a dark-on-dark bug, fixed) |
| `success` / container | `#4ade80` / `#14532d` | |
| `warning` / container | `#fbbf24` / `#78350f` | |
| `scrim` | `rgba(0,0,0,0.7)` | |

Rules:
- Never hardcode hex/rgba in screens or components — always a token.
  White-on-primary overlays use `` `${colors.onPrimary}33` `` style alpha-hex.
  The only tolerated literal is `shadowColor: "#000"` in legacy shadows.
- `tertiary` (orange) belongs to loans. Status meaning comes from the
  `success`/`warning`/`error`/`info` families (use the `Badge` primitive).
- In dark mode, use `colors.primaryBright` for any primary-colored text/icon.

## Typography

Display face: **Plus Jakarta Sans** (titles, money). Body face: **Inter**.
Fonts are embedded natively via the `expo-font` config plugin
(`app.config.js`); files in `assets/fonts/` are named by PostScript name so
`fontFamily` strings resolve identically on iOS and Android.

**Android does not apply `fontWeight` to custom fonts.** Never pair
`fontFamily` with `fontWeight`; resolve the exact family instead:

```ts
import { font } from "@/constants/theme";
fontFamily: font("display", "bold")   // → "PlusJakartaSans-Bold"
fontFamily: font("body", "semibold")  // → "Inter-SemiBold"
```

Bundled weights — display: semibold/bold/extrabold; body:
regular/medium/semibold/bold.

Prefer the sized presets in `typography.styles`: `displayLarge`,
`screenTitle`, `cardTitle`, `sectionLabel` (uppercase eyebrow), `bodyText`,
`bodySmall`, `caption`. Money never uses raw `Text` — see below.

## Money

All NGN amounts render through `components/common/Money`:
Plus Jakarta Sans Bold/ExtraBold, `fontVariant: ["tabular-nums"]`, ₦ symbol at
~70% size and muted. Sizes `sm|md|lg|xl|hero`; tones
`default|muted|onPrimary|success|error`; `signed` adds +/−.

## Elevation — glow is a privilege

Default surface treatment is **flat** (1px `outlineVariant` hairline) or
**raised** (soft neutral `ambientShadow`). The cobalt glow
(`glowMd`/`glowLg`, `shadowColor: colors.primary`) is budgeted:

> **At most two glow surfaces per screen: the hero money card and the primary CTA.**

Use `createElevation(colors)` from `constants/theme`; `theme.shadows` is a
deprecated neutral fallback for unmigrated code.

## Gradient — there is exactly one

`colors.brandGradient` (`#0b50da → #003cad`), used only on hero surfaces:
dashboard contribution hero, contributions-tab portfolio card, success screen
icon. Nothing else gets a gradient (the auth hero's image fade overlay is
functional, not decorative).

## Primitives (`components/common/`)

| Component | Purpose |
|---|---|
| `Screen` | SafeArea + background + optional scroll/keyboard handling |
| `ScreenHeader` | Back / title / right action, `large` variant |
| `Card` | `elevation: "flat" \| "raised" \| "glow"` |
| `Badge` | Status pill from the semantic status families |
| `Money` | Formatted ₦ amounts (see above) |
| `ListItem` | Icon-circle rows for settings/transactions |
| `EmptyState` | Icon + title + message + optional action |
| `Skeleton` | Shimmer placeholder (`text\|card\|row\|circle`) — no raw `ActivityIndicator` for layout placeholders |
| `Button` | Variants `primary\|secondary\|tonal\|outlined\|ghost` — MaterialIcons icons only |
| `Input` | Labeled text field |

Icons: **`@expo/vector-icons` MaterialIcons only.** `expo-symbols` (iOS-only)
was removed; it rendered nothing on Android.

## Writing

Sentence case, plain verbs, no filler. Buttons say exactly what happens
("Back to Home", not "Submit"). Errors say what went wrong and how to fix it;
empty states invite the next action.
