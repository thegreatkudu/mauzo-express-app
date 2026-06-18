/**
 * Core responsive scaling utilities.
 *
 * `scale()` and `moderateScale()` are intentionally computed once at module
 * load time from the initial window dimensions. They give StyleSheet.create()
 * the right starting size for the current device class. Components that need
 * to react to orientation changes should use `useResponsive()` instead.
 *
 * Reference viewport: 390 × 844 (iPhone 14 Pro)
 */

import { Dimensions, PixelRatio } from 'react-native'

const BASE_W = 390   // reference phone width
const BASE_H = 844   // reference phone height

const { width: W, height: H } = Dimensions.get('window')

/**
 * Scale a size proportionally to the current screen width.
 * Use for padding, margins, icon sizes, and border radii.
 */
export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel(size * (W / BASE_W))
}

/**
 * Moderate scale — blends the original size with the fully-scaled value.
 * `factor=0` → no scaling, `factor=1` → full scaling.
 * Default 0.45 keeps typography readable without becoming huge on tablets.
 */
export function moderateScale(size: number, factor = 0.45): number {
  return PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor)
}

/**
 * Scale vertically relative to screen height. Useful for splash / onboarding.
 */
export function verticalScale(size: number): number {
  return PixelRatio.roundToNearestPixel(size * (H / BASE_H))
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Initial screen dimensions (snapshot at launch). */
export const SCREEN = { width: W, height: H } as const
