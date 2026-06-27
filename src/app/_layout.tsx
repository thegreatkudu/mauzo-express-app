import '@/i18n'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Appearance, StyleSheet } from 'react-native'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import * as SystemUI from 'expo-system-ui'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import Providers from '@/config/providers'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { ShimmerProvider } from '@/components/skeletons'
import SplashOverlay from '@/components/SplashOverlay'
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider'
import { lightColors, darkColors } from '@/theme/palette'

import "../../global.css";

// ── Root-view background (module level) ───────────────────────────────────────
//
// Called once when the JS bundle evaluates — before React mounts — to paint the
// native root view with the correct theme background. Without this call the OS
// default (white on both platforms) shows through during the very first frame
// and during native-stack screen transitions while the incoming screen's JS
// content is still being painted.
//
// We derive the colour from the current system scheme so it is correct even
// before the user's saved ThemeMode is loaded from SecureStore.
SystemUI.setBackgroundColorAsync(
  Appearance.getColorScheme() === 'dark' ? darkColors.background : lightColors.background
)

// ── SplashCover ───────────────────────────────────────────────────────────────
//
// Full-screen orange gradient that bridges the gap between the splash screen's
// exit and the home screen's data being ready.
//
// Lifecycle:
//   1. Mounts (opacity 1) the moment the app navigates into the (tabs) group.
//   2. Stays opaque while summaryLoading / ordersLoading are both true on the
//      home screen (see HomeScreen's setHomeReady call).
//   3. Fades to transparent over 500 ms once homeReady flips to true, then
//      removes itself from the tree entirely.
//   4. Resets only when navigating to (auth) — i.e. actual sign-out.
//      Sub-screen navigation (product, order, etc.) does NOT reset it.
//
// The gradient colours match the splash screen exactly so the transition is
// visually seamless: splash plays → cover holds the orange → home fades in.

function SplashCover() {
  const homeReady    = useUiStore(s => s.homeReady)
  const setHomeReady = useUiStore(s => s.setHomeReady)
  const segments     = useSegments()
  const inTabs       = segments[0] === '(tabs)'

  const opacity    = useSharedValue(1)
  const animStyle  = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const [visible, setVisible] = useState(false)
  // Guard: prevent starting the fade animation more than once per visit.
  const isFadingRef = useRef(false)

  // Show on first entry into (tabs); only reset on sign-out (going to auth).
  // Sub-screen navigation (product/[id], order/[id], etc.) no longer resets
  // isFadingRef, so the cover does not reappear on every back-navigation.
  const segment0 = segments[0] as string | undefined
  useEffect(() => {
    if (inTabs) {
      if (!isFadingRef.current) {
        opacity.value = 1
        setVisible(true)
      }
    } else if (segment0 === '(auth)') {
      // Actual sign-out — reset for the next login session.
      setVisible(false)
      opacity.value = 1
      isFadingRef.current = false
      setHomeReady(false)
    }
    // All other segments (product, order, vendor, etc.) — do nothing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inTabs, segment0])

  // Fade out once the home screen signals its data is ready.
  //
  // `visible` is included in the dep array to handle a race condition: when
  // react-query has cached data, HomeScreen's useEffect (child) fires before
  // SplashCover's useEffect (parent), so homeReady can become true before
  // `visible` is true. Without `visible` in deps, the effect would not
  // re-run when `visible` finally becomes true.
  useEffect(() => {
    if (homeReady && visible && !isFadingRef.current) {
      isFadingRef.current = true
      opacity.value = withTiming(
        0,
        { duration: 500, easing: Easing.out(Easing.cubic) },
        (done) => { if (done) scheduleOnRN(setVisible, false) },
      )
    }
  }, [homeReady, visible])

  if (!visible) return null

  return (
    <Animated.View
      pointerEvents='none'
      style={[StyleSheet.absoluteFill, styles.cover, animStyle]}
    >
      <LinearGradient
        // Exact colours from src/app/index.tsx so the handoff is seamless.
        colors={['#8C2800', '#CE4002', '#E8621A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  )
}

// ── NavigationGuard ───────────────────────────────────────────────────────────

function NavigationGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isHydrated      = useAuthStore(s => s.isHydrated)
  const profile         = useAuthStore(s => s.profile)
  const segments        = useSegments()

  const inAuth         = segments[0] === '(auth)'
  const onSplash       = segments[0] === undefined
  const inSubscription = segments[0] === 'subscription'
  const inOnboarding   = segments[0] === '(routes)'

  useEffect(() => {
    if (!isHydrated || onSplash || inOnboarding) return

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/signin')
      return
    }

    if (isAuthenticated && inAuth) {
      const isActive = profile?.subscription?.is_active ?? false
      router.replace(isActive ? '/(tabs)' : '/subscription')
      return
    }

    if (isAuthenticated && !inAuth && !inSubscription) {
      const isActive = profile?.subscription?.is_active ?? false
      if (!isActive) {
        router.replace('/subscription')
      }
    }
  }, [isAuthenticated, isHydrated, inAuth, onSplash, inSubscription, inOnboarding, profile?.subscription?.is_active])

  return null
}

// ── ThemeStatusBar ────────────────────────────────────────────────────────────
// Reads isDark from ThemeContext; cannot live inside ThemeProvider since it needs
// to be a child of it. Placed after all content so the SplashOverlay can override
// status bar visibility during the splash animation.

function ThemeStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

// ── ThemeAwareStack ───────────────────────────────────────────────────────────
// Sets contentStyle on every card so the stack's background matches the active
// theme instead of remaining transparent.
//
// The `index` screen intentionally does NOT get a custom contentStyle —
// AnimatedSplashBackground already sets backgroundColor: '#CE4002' on its own
// root View. Overriding contentStyle at the Stack level with the same orange
// was redundant but caused #CE4002 to leak into the native-stack transition
// container, appearing as an orange strip at the top of the viewport during
// every slide_from_right back gesture.

function ThemeAwareStack() {
  const { theme } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/* animation:none + gestureEnabled:false because index is only ever
          the launch origin; router.replace() is always used to leave it. */}
      <Stack.Screen name="index" options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(routes)/onboarding/index" />
      <Stack.Screen name="product/[id]"   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="vendor/[id]"    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="checkout/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="subscription"   options={{ animation: 'fade' }} />
      <Stack.Screen name="notifications"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notification/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="supplier/[id]"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="order/[id]"        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="checkout/success"  options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  )
}

// ── ThemedRoot ────────────────────────────────────────────────────────────────
// Wraps GestureHandlerRootView with the active theme background on BOTH the
// React layer (backgroundColor style) and the native layer (expo-system-ui).
//
// By moving GestureHandlerRootView inside ThemeProvider, this component can
// read useTheme() and keep the outermost React container colour in sync.
// Without this, GestureHandlerRootView had no background, so the OS default
// (white) was visible through the native-stack transition container whenever
// two screens were simultaneously in-flight during an animation.

function ThemedRoot({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  // Keep the native root-view background in sync whenever the user switches
  // themes. This covers the layer below all React content and is what the
  // native stack transition container renders against.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background)
  }, [theme.colors.background])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {children}
    </GestureHandlerRootView>
  )
}

// ── RootLayout ────────────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrate = useAuthStore(s => s.hydrate)

  const [loaded] = useFonts({
    SpaceMono:         require("../../assets/fonts/SpaceMono-Regular.ttf"),
    "Inter-Regular":   require("../../assets/fonts/Inter-Regular.otf"),
    "Inter-SemiBold":  require("../../assets/fonts/Inter-SemiBold.otf"),
    "Inter-Bold":      require("../../assets/fonts/Inter-Bold.otf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium":  require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold":require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold":    require("../../assets/fonts/Poppins-Bold.ttf"),
    "Raleway-Regular": require("../../assets/fonts/Raleway.otf"),
    "Raleway-Bold":    require("../../assets/fonts/Raleway-Bold.otf"),
  });

  useEffect(() => { hydrate() }, [])

  if (!loaded) return null

  return (
    <ThemeProvider>
      <ThemedRoot>
        <ShimmerProvider>
        <Providers>
          <NavigationGuard />
          <ThemeAwareStack />
          {/* SplashCover: covers the home screen on re-login while data loads. */}
          <SplashCover />
          <ThemeStatusBar />
          {/* SplashOverlay: initial app launch only — renders above everything,
              navigates to the destination while it's still visible, then fades out
              once the destination screen is ready. Eliminates the background flash
              that occurs when a route-based splash exits before the next screen renders. */}
          <SplashOverlay />
        </Providers>
        </ShimmerProvider>
      </ThemedRoot>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  // zIndex 999 places the cover above all Stack screens and tab bars.
  cover: { zIndex: 999 },
})
