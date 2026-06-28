// SRS §6.1 Design Tokens — matches Mauzo Express web platform
export const Colors = {
  // brand
  primary:        '#CE4002',
  accent:         '#CE4002',
  primaryGradient: ['#B33600', '#CE4002'] as [string, string],

  // semantic
  success:  '#1D9E75',
  warning:  '#EF9F27',
  danger:   '#EF4444',
  info:     '#6366f1',

  // surface
  background:   '#F8FAFC',
  card:         '#FFFFFF',
  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',

  // text
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
  textInverse: '#FFFFFF',

  // status pills (order statuses)
  statusAwaitingQuote: '#94A3B8',
  statusQuoteReceived: '#F59E0B',
  statusAccepted:      '#1D9E75',
  statusRejected:      '#EF4444',
  statusDispatched:    '#6366f1',
  statusDelivered:     '#0ea5e9',
  statusCancelled:     '#EF4444',

  // misc
  star:    '#F59E0B',
  overlay: 'rgba(0,0,0,0.45)',
} as const

// Card shadow (SRS §6.1) — standardized to match the app-wide shadow design system
export const CARD_SHADOW = {
  shadowColor: '#f0f0f0',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const
