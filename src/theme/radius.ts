// Border-radius tokens — Snapcart uses gently rounded cards (8-12px)
// and fully-rounded pills for badges/chips.

export const R = {
  xs:   4,
  sm:   8,   // Snapcart card default
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 999, // pill / circle
} as const

export type RadiusKey = keyof typeof R
