/**
 * useResponsive — centralized responsive layout hook.
 *
 * Re-computes on every orientation change / window resize via
 * useWindowDimensions(). Memoised so child components only re-render when
 * the derived values actually change.
 *
 * Breakpoints
 * ───────────
 *  < 375   → smallPhone
 *  375–767 → phone
 *  768–1023→ tablet
 *  ≥ 1024  → largeTablet
 */

import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

export type DeviceType = 'smallPhone' | 'phone' | 'tablet' | 'largeTablet'

// ── Breakpoints ───────────────────────────────────────────────────────────────
export const BP = {
  smallPhone:  0,
  phone:       375,
  tablet:      768,
  largeTablet: 1024,
} as const

function getDeviceType(width: number): DeviceType {
  if (width >= BP.largeTablet) return 'largeTablet'
  if (width >= BP.tablet)      return 'tablet'
  if (width >= BP.phone)       return 'phone'
  return 'smallPhone'
}

// ── Column presets per list type ─────────────────────────────────────────────
const COLS: Record<DeviceType, { suppliers: number; orders: number; products: number }> = {
  smallPhone:  { suppliers: 1, orders: 1, products: 1 },
  phone:       { suppliers: 2, orders: 1, products: 2 },
  tablet:      { suppliers: 3, orders: 2, products: 3 },
  largeTablet: { suppliers: 4, orders: 3, products: 4 },
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export interface ResponsiveValues {
  /** Live window width in dp */
  width: number
  /** Live window height in dp */
  height: number
  /** True when width > height */
  isLandscape: boolean
  isPortrait: boolean

  /** Device category derived from width */
  deviceType: DeviceType
  isSmallPhone: boolean
  isPhone: boolean        // true for both smallPhone AND phone
  isTablet: boolean       // true for both tablet AND largeTablet
  isLargeTablet: boolean

  /** Horizontal page padding (scales with device) */
  hp: number
  /** Vertical section spacing */
  vgap: number
  /** Card gap inside grids */
  gap: number
  /** Max width for content containers on very wide screens */
  contentMaxWidth: number | undefined

  /** Font scale multiplier relative to phone baseline */
  fontScale: number
  /**
   * Responsive font size. Applies moderate scaling capped to reasonable limits.
   * Usage: `fontSize: rf(14)`
   */
  rf: (size: number) => number

  /** Tab bar sizing */
  tabIconSize:   number
  tabFontSize:   number
  tabBarHeight:  number

  /** FlatList column counts */
  suppliersColumns: number
  ordersColumns:    number
  productsColumns:  number
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions()

  return useMemo<ResponsiveValues>(() => {
    const isLandscape = width > height
    const deviceType  = getDeviceType(width)

    const isSmallPhone  = deviceType === 'smallPhone'
    const isPhone       = deviceType === 'smallPhone' || deviceType === 'phone'
    const isTablet      = deviceType === 'tablet'     || deviceType === 'largeTablet'
    const isLargeTablet = deviceType === 'largeTablet'

    // Spacing scales
    const hp   = isLargeTablet ? 32 : isTablet ? 24 : isSmallPhone ? 12 : 16
    const vgap = isTablet ? 28 : 20
    const gap  = isTablet ? 14 : 10

    // Content container max width
    const contentMaxWidth = isLargeTablet ? 1280 : isTablet ? 960 : undefined

    // Typography scaling: gentler scaling keeps text readable without going huge
    const fontScale = isLargeTablet ? 1.14 : isTablet ? 1.07 : isSmallPhone ? 0.94 : 1

    const rf = (size: number) =>
      Math.round(Math.min(Math.max(size * fontScale, size * 0.85), size * 1.3))

    // Tab bar — smallPhone needs tighter values so all 5 tabs fit on 360px screens
    const tabIconSize  = isTablet ? 24 : isSmallPhone ? 20 : 22
    const tabFontSize  = isTablet ? 12 : isSmallPhone ? 10 : 11
    const tabBarHeight = isTablet ? 66 : isSmallPhone ? 52 : 56

    return {
      width,
      height,
      isLandscape,
      isPortrait: !isLandscape,
      deviceType,
      isSmallPhone,
      isPhone,
      isTablet,
      isLargeTablet,
      hp,
      vgap,
      gap,
      contentMaxWidth,
      fontScale,
      rf,
      tabIconSize,
      tabFontSize,
      tabBarHeight,
      suppliersColumns: COLS[deviceType].suppliers,
      ordersColumns:    COLS[deviceType].orders,
      productsColumns:  COLS[deviceType].products,
    }
  }, [width, height])
}
