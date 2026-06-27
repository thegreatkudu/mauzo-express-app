/**
 * @file animations.ts
 * @description Centralised motion design tokens for the Mauzo ordering app.
 *
 * All Reanimated-driven transitions in the app should reference these presets
 * rather than hard-coding physics values inline. This keeps motion consistent
 * across screens and makes global tuning a single-file change.
 *
 * Usage pattern:
 *   withSpring(targetValue, spring.press)
 *   FadeInDown.delay(listStagger(i)).springify().damping(spring.list.damping)...
 *
 * Ported from the expo-expense-tracker-app reference project and adapted for
 * the B2B ordering context (slightly more conservative bounce than a consumer app).
 */

import { Easing } from 'react-native-reanimated'

// ─── Spring presets ────────────────────────────────────────────────────────────
//
// Always pair damping + stiffness together — never set one without the other,
// as the ratio between them controls the overall feel (bounce vs. overdamped).
//
// Higher stiffness  = faster, snappier response
// Lower damping     = more overshoot / bounce before settling

/**
 * Named spring physics presets for the three animation contexts in the app.
 *
 * - `press`  — Micro-interaction for touchable elements (buttons, cards, FABs).
 *              Targets 0.95 scale on press-in, returns to 1 on press-out.
 *              Must feel instant; high stiffness prevents any perceived lag.
 *
 * - `list`   — Staggered entrance for list items (OrderCard, RecentOrderItem, etc.).
 *              Crisp but not mechanical; a touch of overshoot reads as "alive".
 *
 * - `hero`   — Large hero elements (DashboardCard, screen headers, empty states).
 *              Slightly more bounce to draw the eye without feeling unstable.
 */
export const spring = {
  press: { damping: 15, stiffness: 350 } as const,
  list:  { damping: 14, stiffness: 180 } as const,
  hero:  { damping: 12, stiffness: 120 } as const,
} as const

// ─── Timing presets ───────────────────────────────────────────────────────────
//
// Use timing (not spring) for opacity fades, colour transitions, and any
// animation that must finish at a predictable, exact moment.

/**
 * Duration + easing presets for `withTiming`-based transitions.
 *
 * - `fast`   — Icon colour swaps, badge appearance, short opacity fades.
 * - `medium` — Panel slides, tab bar colour changes, modal overlays.
 */
export const timing = {
  fast:   { duration: 150, easing: Easing.out(Easing.quad)  } as const,
  medium: { duration: 300, easing: Easing.out(Easing.cubic) } as const,
} as const

// ─── List stagger helper ──────────────────────────────────────────────────────

/**
 * Calculates the entrance delay (in milliseconds) for a list item at a given index,
 * producing a cascading "waterfall" effect when multiple items animate in together.
 *
 * @param index - Zero-based position of the item in the list.
 * @param base  - Milliseconds between successive items (default 55 ms).
 *                Reduce for long lists (≥10 items) to avoid the last item
 *                feeling slow; increase for short lists to emphasise depth.
 *
 * @example
 * // Inside a FlashList / map renderItem:
 * FadeInDown.delay(listStagger(index, 40)).springify()
 *           .damping(spring.list.damping).stiffness(spring.list.stiffness)
 */
export const listStagger = (index: number, base = 55): number => index * base
