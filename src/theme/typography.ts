// Typography scale — Poppins family matching the existing font setup.
// Snapcart uses a clean sans-serif with tight line-heights on cards.

export const F = {
  regular:  'Poppins-Regular',
  medium:   'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold:     'Poppins-Bold',
} as const

// Type scale (px — React Native points)
export const TS = {
  xs:   10,
  sm:   11,
  base: 12,
  md:   13,
  lg:   14,
  xl:   15,
  xxl:  16,
  h4:   18,
  h3:   20,
  h2:   22,
  h1:   26,
} as const

// Line-height multipliers
export const LH = {
  tight:  1.2,
  normal: 1.4,
  loose:  1.6,
} as const

// Convenience text presets (spread into StyleSheet objects)
export const textStyles = {
  caption: { fontFamily: F.regular,  fontSize: TS.xs,   lineHeight: TS.xs  * LH.normal },
  label:   { fontFamily: F.medium,   fontSize: TS.sm,   lineHeight: TS.sm  * LH.normal },
  body:    { fontFamily: F.regular,  fontSize: TS.base, lineHeight: TS.base * LH.loose },
  bodySB:  { fontFamily: F.semiBold, fontSize: TS.base, lineHeight: TS.base * LH.normal },
  cardTitle:  { fontFamily: F.semiBold, fontSize: TS.md, lineHeight: TS.md  * LH.normal },
  cardName:   { fontFamily: F.bold,     fontSize: TS.lg, lineHeight: TS.lg  * LH.tight  },
  price:      { fontFamily: F.bold,     fontSize: TS.xl, lineHeight: TS.xl  * LH.tight  },
  sectionH:   { fontFamily: F.bold,     fontSize: TS.h4, lineHeight: TS.h4  * LH.tight  },
} as const
