// Snapcart shadow system — converted from the three reference CSS box-shadows
// into React Native shadow/elevation props, plus a vendor preset.
//
// Source CSS:
//   card    → rgba(0, 0, 0, 0.05) 0px 0px 0px 1px
//   soft    → rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset
//   product → rgba(0, 0, 0, 0.05) 0px 1px 2px 0px
//   vendor  → extrapolated from the above pattern for larger / elevated cards
import { Platform } from 'react-native'

type ShadowStyle = {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
} | { elevation: number }

const ios = (color: string, w: number, h: number, opacity: number, radius: number): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: w, height: h },
  shadowOpacity: opacity,
  shadowRadius: radius,
})

function shadow(
  iOSArgs: Parameters<typeof ios>,
  androidElevation: number,
): ShadowStyle {
  return Platform.OS === 'ios'
    ? ios(...iOSArgs)
    : { elevation: androidElevation }
}

// Unified card shadow: rgba(0, 0, 0, 0.04) 0px 2px 5px
export const shadowStyles = {
  card:    shadow(['#000000', 0, 2, 0.04, 5],  2),
  soft:    shadow(['#1B1F23', 0, 1, 0.04, 0],  1),
  product: shadow(['#000000', 0, 2, 0.04, 5],  2),
  vendor:  shadow(['#000000', 0, 4, 0.08, 12], 4),
  float:   shadow(['#000000', 0, 8, 0.10, 16], 8),
} as const

export type ShadowKey = keyof typeof shadowStyles
