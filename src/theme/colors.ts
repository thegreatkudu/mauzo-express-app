// Snapcart-inspired palette adapted to the Mauzo brand.
// Snapcart uses clean white cards, a light gray page background, and a single
// vivid primary — we keep Mauzo's #CE4002 as the primary.
import { Platform } from 'react-native'

export const palette = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  pink:        '#CE4002',
  pinkDark:    '#B33600',
  pinkLight:   '#FEF0E6',
  pinkMuted:   '#FDDCC7',

  indigo:      '#2c489f',
  indigoDark:  '#1a2d6b',
  indigoLight: '#e8ecf8',

  teal:        '#37c0b1',
  tealLight:   '#e3f8f6',

  // ── Semantic ───────────────────────────────────────────────────────────────
  success:     '#22c55e',   // Snapcart "fresh green"
  successLight:'#dcfce7',
  warning:     '#f59e0b',
  warningLight:'#fef9c3',
  error:       '#ef4444',
  errorLight:  '#fee2e2',
  star:        '#f59e0b',

  // ── Neutrals ───────────────────────────────────────────────────────────────
  // Snapcart page background is a very light cool gray
  pageBg:      '#F4F6F8',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F9FAFB',

  dark:        '#1A1A2E',
  text:        '#111827',
  textSub:     '#4B5563',
  textMuted:   '#9CA3AF',

  border:      '#E5E7EB',
  borderLight: '#F3F4F6',

  // ── Badge palette (Snapcart-style) ─────────────────────────────────────────
  hot:         '#ef4444',  // "Hot" badge
  hotText:     '#ffffff',
  sale:        '#f59e0b',  // "Sale" badge
  saleText:    '#ffffff',
  new_:        '#22c55e',  // "New" badge
  newText:     '#ffffff',
  discount:    '#CE4002',  // "-30%" discount badge
  discountText:'#ffffff',

  // ── Overlay ────────────────────────────────────────────────────────────────
  overlay:     'rgba(17,24,39,0.55)',
  overlayLight:'rgba(17,24,39,0.18)',
} as const

export type PaletteKey = keyof typeof palette

// Semantic aliases
export const C = {
  primary:      palette.pink,
  primaryDark:  palette.pinkDark,
  primaryLight: palette.pinkLight,
  secondary:    palette.indigo,
  accent:       palette.teal,
  bg:           palette.pageBg,
  surface:      palette.surface,
  text:         palette.text,
  textSub:      palette.textSub,
  textMuted:    palette.textMuted,
  border:       palette.border,
  borderLight:  palette.borderLight,
  success:      palette.success,
  successLight: palette.successLight,
  warning:      palette.warning,
  error:        palette.error,
  star:         palette.star,
  overlay:      palette.overlay,
} as const
