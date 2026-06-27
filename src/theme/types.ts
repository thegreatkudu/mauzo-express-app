export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

export interface ThemeColors {
  // ── Brand ───────────────────────────────────────────────────────────────────
  primary: string
  primaryDark: string
  primaryLight: string
  primaryMuted: string

  // ── Semantic ─────────────────────────────────────────────────────────────────
  success: string
  successBg: string
  warning: string
  warningBg: string
  danger: string
  dangerBg: string
  info: string
  infoBg: string

  // ── Surfaces ─────────────────────────────────────────────────────────────────
  background: string
  surface: string
  card: string
  cardAlt: string

  // ── Borders ──────────────────────────────────────────────────────────────────
  border: string
  borderLight: string
  divider: string

  // ── Text ─────────────────────────────────────────────────────────────────────
  text: string
  textSub: string
  textMuted: string
  textInverse: string
  textDisabled: string
  placeholder: string

  // ── Input ────────────────────────────────────────────────────────────────────
  inputBg: string
  inputBorder: string
  inputBorderFocus: string

  // ── Navigation ───────────────────────────────────────────────────────────────
  tabBar: string
  tabBarBorder: string
  tabBarActive: string
  tabBarInactive: string

  // ── Order status pills ────────────────────────────────────────────────────────
  statusAwaitingQuote: string
  statusQuoteReceived: string
  statusAccepted: string
  statusRejected: string
  statusDispatched: string
  statusDelivered: string
  statusCancelled: string

  // ── Misc ─────────────────────────────────────────────────────────────────────
  star: string
  overlay: string
  overlayLight: string
  skeleton: string
  skeletonHighlight: string

  // ── Backward-compat aliases (used by Expo template components) ────────────────
  backgroundElement: string
  backgroundSelected: string
  textSecondary: string
}

export interface AppTheme {
  colors: ThemeColors
  isDark: boolean
  scheme: ColorScheme
}

export interface ThemeContextValue {
  theme: AppTheme
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
}
