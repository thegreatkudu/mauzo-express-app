import { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import Animated from 'react-native-reanimated'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import * as SecureStore from 'expo-secure-store'
import { scheduleOnRN } from 'react-native-worklets'
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons'
import { useAnimatedSplash, LOGO_SIZE } from '@/hooks/useAnimatedSplash'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'

const GRADIENT_COLORS: [string, string, string] = ['#8C2800', '#CE4002', '#E8621A']
const RING_SIZE = LOGO_SIZE + 32

// Full-screen splash overlay mounted in _layout.tsx above the Stack.
//
// Unlike a route-based splash, this overlay stays mounted while the destination
// screen renders behind it, then exits once the destination is ready. The user
// never sees a blank frame or a bare background color — the orange gradient is
// present from first frame to last frame of the transition.
//
// Lifecycle for the /(tabs) path:
//   1. Entrance animation plays (2000 ms).
//   2. Auth hydrates → router.replace('/(tabs)') fires immediately.
//   3. Home screen renders behind the overlay and signals homeReady.
//   4. Exit animation plays (320 ms), then overlay unmounts.
//
// Lifecycle for auth / onboarding / subscription paths:
//   1–2. Same as above.
//   3. Exit animation starts immediately after navigation (no data wait needed).
//   4. Overlay unmounts.
export default function SplashOverlay() {
  const isHydrated      = useAuthStore(s => s.isHydrated)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const profile         = useAuthStore(s => s.profile)
  const homeReady       = useUiStore(s => s.homeReady)

  const navigated      = useRef(false)
  const exiting        = useRef(false)
  const animDone       = useRef(false)
  const loaderStarted  = useRef(false)

  const [dismissed,      setDismissed]      = useState(false)
  const [needsHomeReady, setNeedsHomeReady] = useState(false)

  // ── Loading dots ──────────────────────────────────────────────────────────
  const dot1Y = useSharedValue(0); const dot2Y = useSharedValue(0); const dot3Y = useSharedValue(0)
  const dot1O = useSharedValue(0.35); const dot2O = useSharedValue(0.35); const dot3O = useSharedValue(0.35)
  const loaderO = useSharedValue(0)

  const dot1Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot1Y.value }], opacity: dot1O.value }))
  const dot2Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot2Y.value }], opacity: dot2O.value }))
  const dot3Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot3Y.value }], opacity: dot3O.value }))
  const loaderStyle = useAnimatedStyle(() => ({ opacity: loaderO.value }))

  // ── Splash animation hook ─────────────────────────────────────────────────
  const onAnimComplete = useCallback(() => {
    animDone.current = true
    if (isHydrated) {
      resolveAndNavigate()
    } else {
      startLoader()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  const {
    masterStyle,
    logoCircleStyle,
    logoIconStyle,
    shimmerStyle,
    ripple1Style,
    ripple2Style,
    titleStyle,
    taglineStyle,
    exitContainerStyle,
    particleStyles,
    particleConfigs,
    startAnimation,
    triggerExit,
  } = useAnimatedSplash(onAnimComplete)

  // Kick off the entrance animation.
  useEffect(() => {
    const id = setTimeout(startAnimation, 16)
    return () => clearTimeout(id)
  }, [startAnimation])

  // Hydration completed after the entrance animation already finished.
  useEffect(() => {
    if (!isHydrated || !animDone.current || navigated.current) return
    stopLoaderThen(() => resolveAndNavigate())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  // Tabs path: exit once the home screen signals its data is ready.
  useEffect(() => {
    if (!homeReady || !needsHomeReady || exiting.current) return
    performExit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeReady, needsHomeReady])

  // Safety valve: force exit after 8 s in case homeReady never fires
  // (e.g. network failure, unhandled error in the home screen).
  useEffect(() => {
    if (!needsHomeReady) return
    const id = setTimeout(() => { if (!exiting.current) performExit() }, 8000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsHomeReady])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function startLoader() {
    if (loaderStarted.current) return
    loaderStarted.current = true
    loaderO.value = withTiming(1, { duration: 300 })
    const animateDot = (dotY: typeof dot1Y, dotO: typeof dot1O, delay: number) => {
      dotY.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(-9, { duration: 380, easing: Easing.inOut(Easing.sin) }),
          withTiming( 0, { duration: 380, easing: Easing.inOut(Easing.sin) }),
        ), -1, false,
      ))
      dotO.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(1,    { duration: 380 }),
          withTiming(0.35, { duration: 380 }),
        ), -1, false,
      ))
    }
    animateDot(dot1Y, dot1O, 0)
    animateDot(dot2Y, dot2O, 180)
    animateDot(dot3Y, dot3O, 360)
  }

  function stopLoaderThen(onDone: () => void) {
    loaderO.value = withTiming(
      0,
      { duration: 220, easing: Easing.out(Easing.cubic) },
      (finished) => { if (finished) scheduleOnRN(onDone) },
    )
  }

  function performExit() {
    if (exiting.current) return
    exiting.current = true
    triggerExit(() => setDismissed(true))
  }

  // Navigate to the correct destination FIRST, then exit the overlay.
  // For /(tabs): home screen renders behind us while we wait for homeReady.
  // For everything else: exit immediately after navigation.
  function resolveAndNavigate() {
    if (navigated.current) return
    navigated.current = true

    SecureStore.getItemAsync('mauzo_onboarding_seen')
      .then(seen => {
        if (!seen) {
          router.replace('/onboarding' as any)
          performExit()
        } else if (isAuthenticated) {
          const isActive = profile?.subscription?.is_active ?? false
          if (isActive) {
            router.replace('/(tabs)')
            setNeedsHomeReady(true)
          } else {
            router.replace('/subscription' as any)
            performExit()
          }
        } else {
          router.replace('/(auth)/signin')
          performExit()
        }
      })
      .catch(() => {
        router.replace('/onboarding' as any)
        performExit()
      })
  }

  if (dismissed) return null

  return (
    <View style={styles.overlay}>
      <StatusBar hidden />

      <Animated.View style={[StyleSheet.absoluteFill, masterStyle]}>

        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {particleConfigs.map((cfg, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width:           cfg.size,
                height:          cfg.size,
                borderRadius:    cfg.size / 2,
                left:            cfg.x,
                top:             cfg.y,
                backgroundColor: `rgba(255,248,238,${cfg.opacity})`,
              },
              particleStyles[i],
            ]}
          />
        ))}

        <Animated.View style={[styles.center, exitContainerStyle]}>
          <Animated.View style={[styles.rippleRing, ripple1Style]} />
          <Animated.View style={[styles.rippleRing, ripple2Style]} />
          <View style={styles.outerRing} />

          <Animated.View style={[styles.logoCircle, logoCircleStyle]}>
            <View style={styles.shimmerClip} pointerEvents='none'>
              <Animated.View style={[styles.shimmerBar, shimmerStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Animated.View style={logoIconStyle}>
              <HugeiconsIcon icon={ShoppingBag01Icon as any} size={56} color='#CE4002' strokeWidth={1.6} />
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={styles.title}>MAUZO</Text>
          </Animated.View>
          <Animated.View style={taglineStyle}>
            <Text style={styles.tagline}>YOUR MARKETPLACE, DELIVERED</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.loaderWrap, loaderStyle]} pointerEvents='none'>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </Animated.View>

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
    zIndex:   1000,
  },
  particle: {
    position: 'absolute',
  },
  center: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingBottom:   40,
  },
  rippleRing: {
    position:     'absolute',
    width:        LOGO_SIZE,
    height:       LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth:  2,
    borderColor:  'rgba(255,248,238,0.45)',
  },
  outerRing: {
    position:     'absolute',
    width:        RING_SIZE,
    height:       RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth:  1.5,
    borderColor:  'rgba(255,248,238,0.22)',
  },
  logoCircle: {
    width:           LOGO_SIZE,
    height:          LOGO_SIZE,
    borderRadius:    LOGO_SIZE / 2,
    backgroundColor: '#fff',
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius:  20,
      },
      android: { elevation: 12 },
    }),
  },
  shimmerClip: {
    position:     'absolute',
    top:          0,
    left:         0,
    right:        0,
    bottom:       0,
    borderRadius: LOGO_SIZE / 2,
    overflow:     'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top:      0,
    bottom:   0,
    width:    LOGO_SIZE * 0.6,
  },
  titleWrap: { marginTop: 28 },
  title: {
    fontFamily:    'Poppins-Bold',
    fontSize:      42,
    color:         '#fff8ee',
    letterSpacing: 8,
    textAlign:     'center',
  },
  tagline: {
    fontFamily:    'Poppins-Regular',
    fontSize:      11,
    color:         'rgba(255,248,238,0.72)',
    letterSpacing: 2.5,
    textAlign:     'center',
    marginTop:     8,
  },
  loaderWrap: {
    position:       'absolute',
    bottom:         72,
    left:           0,
    right:          0,
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            10,
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: '#fff8ee',
  },
})
