// Snapcart shadow system — converted from the three reference CSS box-shadows
// into React Native shadow/elevation props, plus a vendor preset.
//
// Source CSS:
//   card    → rgba(0, 0, 0, 0.05) 0px 0px 0px 1px
//   soft    → rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset
//   product → rgba(0, 0, 0, 0.05) 0px 1px 2px 0px
//   vendor  → extrapolated from the above pattern for larger / elevated cards
import { Platform } from 'react-native'

const ios = (color: string, w: number, h: number, opacity: number, radius: number) => ({
  shadowColor: color,
  shadowOffset: { width: w, height: h },
  shadowOpacity: opacity,
  shadowRadius: radius,
})

// Snapcart's shadows are deliberately very soft — almost border-like.
// On Android we use minimal elevation values to match that subtlety.
export const shadowStyles = {
  // rgba(0, 0, 0, 0.05) 0px 0px 0px 1px  — subtle outline / boundary
  card: Platform.select({
    ios:     { ...ios('#000000', 0, 0, 0.05, 1), borderWidth: 0 },
    android: { elevation: 1 },
  })!,

  // rgba(27, 31, 35, 0.04) 0px 1px 0px  — feather-light lift (button/chip)
  soft: Platform.select({
    ios:     ios('#1B1F23', 0, 1, 0.04, 0),
    android: { elevation: 1 },
  })!,

  // rgba(0, 0, 0, 0.05) 0px 1px 2px 0px  — clean product card depth
  product: Platform.select({
    ios:     ios('#000000', 0, 1, 0.05, 2),
    android: { elevation: 2 },
  })!,

  // Extrapolated for vendor / article cards that need a bit more presence
  vendor: Platform.select({
    ios:     ios('#000000', 0, 4, 0.08, 12),
    android: { elevation: 4 },
  })!,

  // Floating action elements (search bar, FABs)
  float: Platform.select({
    ios:     ios('#000000', 0, 8, 0.10, 16),
    android: { elevation: 8 },
  })!,
} as const

export type ShadowKey = keyof typeof shadowStyles
