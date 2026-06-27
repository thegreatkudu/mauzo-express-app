import { useCallback } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Dimensions } from 'react-native'

const { width: SCREEN_W } = Dimensions.get('window')
const LOGO_SIZE = 128

const PARTICLES = [
  { x: -40,           y: 80,            size: 160, opacity: 0.08, phase: 0 },
  { x: SCREEN_W - 80, y: 40,            size: 96,  opacity: 0.06, phase: 1 },
  { x: 20,            y: 380,           size: 64,  opacity: 0.10, phase: 2 },
  { x: SCREEN_W - 60, y: 300,           size: 120, opacity: 0.07, phase: 3 },
  { x: SCREEN_W / 2,  y: -30,           size: 80,  opacity: 0.06, phase: 4 },
  { x: 60,            y: 560,           size: 192, opacity: 0.05, phase: 5 },
] as const

export type ParticleConfig = (typeof PARTICLES)[number]
export { PARTICLES, LOGO_SIZE }

export function useAnimatedSplash(onComplete: () => void) {
  // ── Shared values ─────────────────────────────────────────────────────────
  //
  // masterOpacity is the single source of truth for the entire splash's
  // visibility. Everything — gradient, particles, logo, text — lives inside
  // one Animated.View that carries this opacity. Entrance and exit are
  // therefore always perfectly simultaneous.
  const masterOpacity  = useSharedValue(0)

  // Internal motion values (transform-only, no separate opacity control)
  const logoScale      = useSharedValue(0)
  const logoIconRotate = useSharedValue(0)
  const shimmerX       = useSharedValue(-LOGO_SIZE)
  const ripple1Scale   = useSharedValue(1)
  const ripple1Opacity = useSharedValue(0)
  const ripple2Scale   = useSharedValue(1)
  const ripple2Opacity = useSharedValue(0)
  const titleY         = useSharedValue(30)
  const titleScale     = useSharedValue(1)
  const taglineY       = useSharedValue(8)
  const exitScale      = useSharedValue(1)
  // readySignal fires onComplete via a zero-duration timing with no visual effect.
  const readySignal    = useSharedValue(0)

  const p0Y = useSharedValue(0); const p1Y = useSharedValue(0)
  const p2Y = useSharedValue(0); const p3Y = useSharedValue(0)
  const p4Y = useSharedValue(0); const p5Y = useSharedValue(0)
  const particleYValues = [p0Y, p1Y, p2Y, p3Y, p4Y, p5Y]

  // ── Animated styles ───────────────────────────────────────────────────────

  // Single master wrapper — controls the opacity of the entire splash screen.
  const masterStyle = useAnimatedStyle(() => ({
    opacity: masterOpacity.value,
  }))

  const logoCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))

  const logoIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoIconRotate.value}deg` }],
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }))

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1Scale.value }],
    opacity: ripple1Opacity.value,
  }))

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2Scale.value }],
    opacity: ripple2Opacity.value,
  }))

  // Title and tagline: transform-only (no opacity — masterOpacity owns visibility)
  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: titleY.value },
      { scale: titleScale.value },
    ],
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineY.value }],
  }))

  // exitContainerStyle: scale-up effect on exit only (no opacity — master handles it)
  const exitContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
  }))

  const particleStyles = particleYValues.map((pY) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ transform: [{ translateY: pY.value }] }))
  )

  // ── Start sequence ────────────────────────────────────────────────────────
  const startAnimation = useCallback(() => {
    const EASE_OUT = Easing.out(Easing.cubic)
    const EASE_IN  = Easing.in(Easing.cubic)

    // t=0 — everything fades in together as one unit
    masterOpacity.value = withTiming(1, { duration: 380, easing: EASE_OUT })

    // t=0 — particles begin floating (continuous, no delay so they're moving on reveal)
    particleYValues.forEach((pY, i) => {
      pY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 3000 + i * 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(12,  { duration: 3000 + i * 400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      )
    })

    // t=0 — logo circle spring bounce (starts immediately with the fade-in)
    logoScale.value = withSpring(1, { damping: 12, stiffness: 180, mass: 0.8 })

    // t=300ms — logo icon rotates 360° once
    logoIconRotate.value = withDelay(
      300,
      withTiming(360, { duration: 600, easing: Easing.inOut(Easing.quad) }),
    )

    // t=500ms — shimmer sweep
    shimmerX.value = withDelay(
      500,
      withTiming(LOGO_SIZE + 20, { duration: 400, easing: Easing.out(Easing.quad) }),
    )

    // t=200ms — title rises into position
    titleY.value = withDelay(
      200,
      withSpring(0, { damping: 18, stiffness: 120 }),
    )

    // t=600ms — subtle breathing pulse on title (runs indefinitely)
    titleScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.00, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    )

    // t=350ms — tagline slides up into position
    taglineY.value = withDelay(
      350,
      withTiming(0, { duration: 400, easing: EASE_OUT }),
    )

    // t=700ms — ripple 1
    ripple1Opacity.value = withDelay(700, withTiming(0, { duration: 800, easing: EASE_IN }))
    ripple1Scale.value   = withDelay(
      700,
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(2.5, { duration: 800, easing: EASE_IN }),
      ),
    )

    // t=1000ms — ripple 2
    ripple2Opacity.value = withDelay(1000, withTiming(0, { duration: 800, easing: EASE_IN }))
    ripple2Scale.value   = withDelay(
      1000,
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(2.5, { duration: 800, easing: EASE_IN }),
      ),
    )

    // t=2000ms — signal that the entrance is complete; no visual change here.
    // triggerExit() is responsible for all exit visuals.
    readySignal.value = withDelay(
      2000,
      withTiming(1, { duration: 1 }, (finished) => {
        if (finished) scheduleOnRN(onComplete)
      }),
    )
  }, [onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Final exit ────────────────────────────────────────────────────────────
  // Fades the master opacity to 0 and scales the content up slightly.
  // Background, particles, logo, title and tagline all disappear in one motion.
  function triggerExit(onDone: () => void) {
    const DURATION = 320
    const ease     = Easing.in(Easing.cubic)

    // Scale-up gives a subtle "pull away" feel as everything fades
    exitScale.value = withTiming(1.06, { duration: DURATION, easing: ease })

    // Single fade-out drives everything simultaneously
    masterOpacity.value = withTiming(
      0,
      { duration: DURATION, easing: ease },
      (finished) => { if (finished) scheduleOnRN(onDone) },
    )
  }

  return {
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
    startAnimation,
    triggerExit,
    particleConfigs: PARTICLES,
  }
}
