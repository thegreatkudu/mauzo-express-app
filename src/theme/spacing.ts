// 4-point base grid — mirrors Snapcart's consistent spacing rhythm.
// Use named tokens instead of raw numbers throughout the app.

export const S = {
  px:   1,
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  huge: 48,
  page: 16,   // standard horizontal page margin
  section: 24, // vertical gap between home-page sections
} as const

export type SpacingKey = keyof typeof S
