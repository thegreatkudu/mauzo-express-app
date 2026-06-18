import '@/i18n'
import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Providers from '@/config/providers'
import { useAuthStore } from '@/store/auth.store'
import { ShimmerProvider } from '@/components/skeletons'

import "../../global.css";

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
      <ShimmerProvider>
      <Providers>
        <NavigationGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(routes)/onboarding/index" />
          <Stack.Screen name="subscription" options={{ animation: 'fade' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="supplier/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order/[id]"    options={{ animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="dark" />
      </Providers>
      </ShimmerProvider>
    </GestureHandlerRootView>
  )
}
