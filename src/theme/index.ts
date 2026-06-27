// Central theme barrel — import everything from '@/theme'
export { palette, C }    from './colors'
export { shadowStyles }  from './shadows'
export { S }             from './spacing'
export { F, TS, LH, textStyles } from './typography'
export { R }             from './radius'

// Theme system (light / dark / system)
export { lightColors, darkColors } from './palette'
export type { ThemeMode, ColorScheme, ThemeColors, AppTheme, ThemeContextValue } from './types'

export type { PaletteKey }  from './colors'
export type { ShadowKey }   from './shadows'
export type { SpacingKey }  from './spacing'
export type { RadiusKey }   from './radius'
