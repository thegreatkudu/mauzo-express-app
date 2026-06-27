import type { ThemeColors } from './types'

export const lightColors: ThemeColors = {
  // Brand — Mauzo orange
  primary:      '#CE4002',
  primaryDark:  '#B33600',
  primaryLight: '#FEF0E6',
  primaryMuted: '#FDDCC7',

  // Semantic
  success:    '#1D9E75',
  successBg:  '#D1FAE5',
  warning:    '#EF9F27',
  warningBg:  '#FEF9C3',
  danger:     '#EF4444',
  dangerBg:   '#FEE2E2',
  info:       '#6366F1',
  infoBg:     '#EEF2FF',

  // Surfaces
  background: '#F8FAFC',
  surface:    '#FFFFFF',
  card:       '#FFFFFF',
  cardAlt:    '#F9FAFB',

  // Borders
  border:      '#E2E8F0',
  borderLight: '#F4F4F4',
  divider:     '#F0F0F0',

  // Text
  text:         '#111827',
  textSub:      '#6B7280',
  textMuted:    '#9CA3AF',
  textInverse:  '#FFFFFF',
  textDisabled: '#D1D5DB',
  placeholder:  '#9CA3AF',

  // Input
  inputBg:           '#F9FAFB',
  inputBorder:       '#E8E8E8',
  inputBorderFocus:  '#CE4002',

  // Navigation
  tabBar:         '#FFFFFF',
  tabBarBorder:   '#EFEFEF',
  tabBarActive:   '#CE4002',
  tabBarInactive: '#9CA3AF',

  // Order statuses
  statusAwaitingQuote: '#94A3B8',
  statusQuoteReceived: '#F59E0B',
  statusAccepted:      '#1D9E75',
  statusRejected:      '#EF4444',
  statusDispatched:    '#6366F1',
  statusDelivered:     '#0EA5E9',
  statusCancelled:     '#EF4444',

  // Misc
  star:              '#F59E0B',
  overlay:           'rgba(0,0,0,0.45)',
  overlayLight:      'rgba(0,0,0,0.18)',
  skeleton:          '#E2E8F0',
  skeletonHighlight: '#F8FAFC',

  // Backward-compat
  backgroundElement:  '#F9FAFB',
  backgroundSelected: '#F1F5F9',
  textSecondary:      '#6B7280',
}

export const darkColors: ThemeColors = {
  // Brand — slightly brighter on dark backgrounds
  primary:      '#F4621A',
  primaryDark:  '#CE4002',
  primaryLight: '#3D1A08',
  primaryMuted: '#2A1205',

  // Semantic
  success:   '#34D399',
  successBg: '#052E1C',
  warning:   '#FBBF24',
  warningBg: '#2D2006',
  danger:    '#F87171',
  dangerBg:  '#2D0707',
  info:      '#818CF8',
  infoBg:    '#1E1B4B',

  // Surfaces — GitHub-dark inspired, warm-tinted for brand cohesion
  background: '#0D1117',
  surface:    '#161B22',
  card:       '#1C2128',
  cardAlt:    '#13181F',

  // Borders
  border:      '#30363D',
  borderLight: '#21262D',
  divider:     '#21262D',

  // Text
  text:         '#E6EDF3',
  textSub:      '#8B949E',
  textMuted:    '#6E7681',
  textInverse:  '#0D1117',
  textDisabled: '#484F58',
  placeholder:  '#6E7681',

  // Input
  inputBg:          '#161B22',
  inputBorder:      '#30363D',
  inputBorderFocus: '#F4621A',

  // Navigation
  tabBar:         '#161B22',
  tabBarBorder:   '#30363D',
  tabBarActive:   '#F4621A',
  tabBarInactive: '#6E7681',

  // Order statuses — slightly desaturated for dark bg legibility
  statusAwaitingQuote: '#6E7681',
  statusQuoteReceived: '#D97706',
  statusAccepted:      '#16A34A',
  statusRejected:      '#DC2626',
  statusDispatched:    '#6366F1',
  statusDelivered:     '#0284C7',
  statusCancelled:     '#DC2626',

  // Misc
  star:              '#D97706',
  overlay:           'rgba(0,0,0,0.75)',
  overlayLight:      'rgba(0,0,0,0.45)',
  skeleton:          '#21262D',
  skeletonHighlight: '#30363D',

  // Backward-compat
  backgroundElement:  '#1C2128',
  backgroundSelected: '#30363D',
  textSecondary:      '#8B949E',
}
