import '@/global.css'
import { Platform } from 'react-native'

export const Brand = {
  pink: '#CE4002',
  pinkDeep: '#B33600',
  pinkLight: '#FEF0E6',
  blue: '#2c489f',
  blueDark: '#312d8a',
  teal: '#37c0b1',
  beige: '#cac2b2',
  orange: '#CE4002',
  orangeBtn: '#B33600',
  orangeBtn2: '#CE4002',
  cream: '#fff7ee',
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800

// ── Extended Design System ────────────────────────────────────────────────────

export const COLORS = {
  primary:        '#CE4002',
  primaryLight:   '#FEF0E6',
  primaryDark:    '#B33600',
  primaryMuted:   '#FDDCC7',
  secondary:      '#2c489f',
  secondaryLight: '#e8ecf8',
  accent:         '#FFB800',
  accentLight:    '#FFF8E1',
  teal:           '#37c0b1',
  indigo:         '#2c489f',
  background:     '#F8F7FA',
  surface:        '#FFFFFF',
  surfaceAlt:     '#F9FAFB',
  dark:           '#1A1A2E',
  text:           '#111827',
  textSub:        '#64748B',
  textTertiary:   '#9CA3AF',
  border:         '#F1F5F9',
  borderMed:      '#E5E7EB',
  success:        '#10B981',
  successLight:   '#ECFDF5',
  warning:        '#F59E0B',
  error:          '#EF4444',
  star:           '#F59E0B',
  overlay:        'rgba(26,26,46,0.55)',
} as const

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, page: 16,
} as const

export const RADIUS = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, full: 999,
} as const

export const FONT = {
  regular:  'Poppins-Regular',
  medium:   'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold:     'Poppins-Bold',
} as const

export const SHADOW = {
  sm: Platform.select({
    ios:     { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
    android: { elevation: 2 },
  })!,
  md: Platform.select({
    ios:     { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 8 },
    android: { elevation: 4 },
  })!,
  lg: Platform.select({
    ios:     { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 8 },
  })!,
  xl: Platform.select({
    ios:     { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 20 },
    android: { elevation: 12 },
  })!,
} as const
