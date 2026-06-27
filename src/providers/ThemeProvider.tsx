import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Appearance } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { lightColors, darkColors } from '@/theme/palette'
import type { AppTheme, ColorScheme, ThemeContextValue, ThemeMode } from '@/theme/types'

const STORAGE_KEY = 'mauzo_theme_mode'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveScheme(mode: ThemeMode, system: ColorScheme): ColorScheme {
  return mode === 'system' ? system : mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(
    () => (Appearance.getColorScheme() ?? 'light') as ColorScheme,
  )

  // Load the user's persisted choice. Starts rendering with 'system' default
  // so SplashOverlay covers any brief palette switch on first launch.
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved)
      }
    })
  }, [])

  // Track OS-level appearance changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme((colorScheme ?? 'light') as ColorScheme)
    })
    return () => sub.remove()
  }, [])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    SecureStore.setItemAsync(STORAGE_KEY, newMode).catch(() => {})
  }, [])

  const scheme = resolveScheme(mode, systemScheme)
  const isDark = scheme === 'dark'

  const theme = useMemo<AppTheme>(
    () => ({ colors: isDark ? darkColors : lightColors, isDark, scheme }),
    [isDark, scheme],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, isDark, setMode }),
    [theme, mode, isDark, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be called inside <ThemeProvider>')
  return ctx
}

/**
 * Creates a memoized StyleSheet from a factory function that receives the
 * current AppTheme. Re-runs only when the theme (light ↔ dark) changes.
 *
 * ```tsx
 * const styles = useThemeStyles(theme => StyleSheet.create({
 *   root: { backgroundColor: theme.colors.background },
 * }))
 * ```
 */
export function useThemeStyles<T>(factory: (theme: AppTheme) => T): T {
  const { theme } = useTheme()
  return useMemo(() => factory(theme), [theme])
}
