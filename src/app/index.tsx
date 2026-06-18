import { useCallback, useEffect, useRef } from 'react'
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
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import * as SecureStore from 'expo-secure-store'

import { ShoppingBag01Icon } from '@hugeicons/core-free-icons'
import { useAnimatedSplash, LOGO_SIZE } from '@/hooks/useAnimatedSplash'
import { useAuthStore } from '@/store/auth.store'

const { width: SCREEN_W } = Dimensions.get('window')

// Brand warm gradient: deep burnt → brand orange → light tangerine
const GRADIENT_COLORS: [string, string, string] = ['#8C2800', '#CE4002', '#E8621A']

// Cream accent used for all decorative elements on the orange bg
const CREAM = '#fff8ee'

export default function SplashScreen() {
  const isHydrated      = useAuthStore(s => s.isHydrated)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const profile         = useAuthStore(s => s.profile)

  // ── State refs (no re-render needed) ─────────────────────────────────────
  const routed        = useRef(false)
  const animDone      = useRef(false)
  const loaderStarted = useRef(false)

  // ── Loading dots animation values ─────────────────────────────────────────
  const dot1Y = useSharedValue(0)
  const dot2Y = useSharedValue(0)
  const dot3Y = useSharedValue(0)
  const dot1O = useSharedValue(0.35)
  const dot2O = useSharedValue(0.35)
  const dot3O = useSharedValue(0.35)
  const loaderO = useSharedValue(0)

  const dot1Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot1Y.value }], opacity: dot1O.value }))
  const dot2Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot2Y.value }], opacity: dot2O.value }))
  const dot3Style   = useAnimatedStyle(() => ({ transform: [{ translateY: dot3Y.value }], opacity: dot3O.value }))
  const loaderStyle = useAnimatedStyle(() => ({ opacity: loaderO.value }))

  // ── Primary splash hook ───────────────────────────────────────────────────
  const onAnimComplete = useCallback(() => {
    animDone.current = true
    // If hydration already finished while we were animating — go straight to exit
    if (isHydrated) {
      resolveAndNavigate()
    } else {
      // Show dots while we wait for hydration
      startLoader()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  const {
    backgroundStyle,
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

  // ── Kick off the animation on mount ──────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(startAnimation, 16)
    return () => clearTimeout(id)
  }, [startAnimation])

  // ── React to hydration completing AFTER the animation ────────────────────
  useEffect(() => {
    if (!isHydrated || !animDone.current || routed.current) return
    // Animation already finished and we were showing the loader — now navigate
    stopLoaderThen(() => resolveAndNavigate())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function startLoader() {
    if (loaderStarted.current) return
    loaderStarted.current = true

    // Fade the dot container in
    loaderO.value = withTiming(1, { duration: 300 })

    // Bouncing wave: each dot offset by 180 ms
    const animateDot = (
      dotY: typeof dot1Y,
      dotO: typeof dot1O,
      delay: number,
    ) => {
      dotY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-9, { duration: 380, easing: Easing.inOut(Easing.sin) }),
            withTiming( 0, { duration: 380, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        ),
      )
      dotO.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1,    { duration: 380 }),
            withTiming(0.35, { duration: 380 }),
          ),
          -1,
          false,
        ),
      )
    }

    animateDot(dot1Y, dot1O, 0)
    animateDot(dot2Y, dot2O, 180)
    animateDot(dot3Y, dot3O, 360)
  }

  function stopLoaderThen(onDone: () => void) {
    loaderO.value = withTiming(
      0,
      { duration: 220, easing: Easing.out(Easing.cubic) },
      (finished) => { if (finished) runOnJS(onDone)() },
    )
  }

  function resolveAndNavigate() {
    if (routed.current) return
    routed.current = true

    const navigate = (dest: string) => triggerExit(() => router.replace(dest as any))

    SecureStore.getItemAsync('mauzo_onboarding_seen')
      .then(seen => {
        if (!seen) {
          navigate('/onboarding')
        } else if (isAuthenticated) {
          const isActive = profile?.subscription?.is_active ?? false
          navigate(isActive ? '/(tabs)' : '/subscription')
        } else {
          navigate('/(auth)/signin')
        }
      })
      .catch(() => navigate('/onboarding'))
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* ── Gradient background ── */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Decorative particles ── */}
      {particleConfigs.map((cfg, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width:        cfg.size,
              height:       cfg.size,
              borderRadius: cfg.size / 2,
              left:         cfg.x,
              top:          cfg.y,
              backgroundColor: `rgba(255,248,238,${cfg.opacity})`,
            },
            particleStyles[i],
          ]}
        />
      ))}

      {/* ── Centre column (logo + text) ── */}
      <Animated.View style={[styles.center, exitContainerStyle]}>

        <Animated.View style={[styles.rippleRing, ripple1Style]} />
        <Animated.View style={[styles.rippleRing, ripple2Style]} />
        <View style={styles.outerRing} />

        {/* Logo circle */}
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
            <HugeiconsIcon
              icon={ShoppingBag01Icon as any}
              size={56}
              color='#CE4002'
              strokeWidth={1.6}
            />
          </Animated.View>
        </Animated.View>

        {/* Brand name */}
        <Animated.View style={[styles.titleWrap, titleStyle]}>
          <Text style={styles.title}>MAUZO</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>YOUR MARKETPLACE, DELIVERED</Text>
        </Animated.View>

      </Animated.View>

      {/* ── Loading dots — visible only while waiting for hydration ── */}
      <Animated.View style={[styles.loaderWrap, loaderStyle]} pointerEvents='none'>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </Animated.View>

    </View>
  )
}

const RING_SIZE = LOGO_SIZE + 32

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#CE4002',
  },
  particle: {
    position: 'absolute',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },

  rippleRing: {
    position: 'absolute',
    width:        LOGO_SIZE,
    height:       LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth:  2,
    borderColor:  'rgba(255,248,238,0.45)',
  },
  outerRing: {
    position: 'absolute',
    width:        RING_SIZE,
    height:       RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth:  1.5,
    borderColor:  'rgba(255,248,238,0.22)',
  },

  logoCircle: {
    width:        LOGO_SIZE,
    height:       LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    ...StyleSheet.absoluteFill,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top:    0,
    bottom: 0,
    width:  LOGO_SIZE * 0.6,
  },

  titleWrap: { marginTop: 28 },
  title: {
    fontFamily:  'Poppins-Bold',
    fontSize:    42,
    color:       '#fff8ee',
    letterSpacing: 8,
    textAlign:   'center',
  },
  tagline: {
    fontFamily:   'Poppins-Regular',
    fontSize:     11,
    color:        'rgba(255,248,238,0.72)',
    letterSpacing: 2.5,
    textAlign:    'center',
    marginTop:    8,
  },

  // ── Loading dots ──
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
