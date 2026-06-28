// Premium shadow design system — light tint, minimal offset, low opacity.
// All values unified (no Platform.select) — React Native ignores irrelevant props per platform.

export const shadows = {
  subtle: {
    shadowColor: '#f0f0f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#f0f0f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  heavy: {
    shadowColor: '#f0f0f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

// Backward-compatible aliases used by existing components
export const shadowStyles = {
  card:    shadows.subtle,
  soft:    shadows.subtle,
  product: shadows.subtle,
  vendor:  shadows.medium,
  float:   shadows.heavy,
} as const

export type ShadowKey   = keyof typeof shadowStyles
export type ShadowLevel = keyof typeof shadows
