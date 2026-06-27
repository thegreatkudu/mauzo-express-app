import '@/i18n'
import { useEffect, useState } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
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

import "../../global.css";

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
//   4. Resets (and re-shows next time) when the user leaves (tabs) — e.g.
//      after sign-out, the next sign-in gets a fresh cover.
//
// The gradient colours match the splash screen exactly so the transition is
// visually seamless: splash plays → cover holds the orange → home fades in.

function SplashCover() {
  const homeReady    = useUiStore(s => s.homeReady)
  const setHomeReady = useUiStore(s => s.setHomeReady)
  const segments     = useSegments()
  const inTabs       = segments[0] === '(tabs)'

  const opacity  = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const [visible, setVisible] = useState(false)

  // Show when entering (tabs); reset when leaving so re-login gets a fresh cover.
  useEffect(() => {
    if (inTabs) {
      opacity.value = 1          // ensure full opacity (resets after a re-login)
      setVisible(true)
    } else {
      // Leaving tabs (sign-out) — reset everything silently for next session.
      setVisible(false)
      opacity.value = 1
      setHomeReady(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inTabs])

  // Fade out once the home screen signals its data is ready.
  useEffect(() => {
    if (homeReady && visible) {
      opacity.value = withTiming(
        0,
        { duration: 500, easing: Easing.out(Easing.cubic) },
        (done) => { if (done) scheduleOnRN(setVisible, false) },
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeReady])

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
      <ShimmerProvider>
      <Providers>
        <NavigationGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(routes)/onboarding/index" />
          <Stack.Screen name="subscription" options={{ animation: 'fade' }} />
          <Stack.Screen name="notifications"     options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notification/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="supplier/[id]"  options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order/[id]"     options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout/success" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack>
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
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  // zIndex 999 places the cover above all Stack screens and tab bars.
  cover: { zIndex: 999 },
})
