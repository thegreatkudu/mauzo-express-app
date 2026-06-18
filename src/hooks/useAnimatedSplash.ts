import { useCallback } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { Dimensions } from 'react-native'

const { width: SCREEN_W } = Dimensions.get('window')
const LOGO_SIZE = 128 // w-32

// 6 decorative particle circles — fixed positions & sizes
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
  const bgOpacity      = useSharedValue(0)
  // Separate exit value so triggerExit() controls the final bg fade independently
  const exitBgOpacity  = useSharedValue(1)
  const logoScale      = useSharedValue(0)
  const logoIconRotate = useSharedValue(0)
  const shimmerX       = useSharedValue(-LOGO_SIZE)
  const ripple1Scale   = useSharedValue(1)
  const ripple1Opacity = useSharedValue(0)
  const ripple2Scale   = useSharedValue(1)
  const ripple2Opacity = useSharedValue(0)
  const titleY         = useSharedValue(40)
  const titleOpacity   = useSharedValue(0)
  const titleScale     = useSharedValue(1)
  const taglineY       = useSharedValue(10)
  const taglineOpacity = useSharedValue(0)
  const exitScale      = useSharedValue(1)
  const exitOpacity    = useSharedValue(1)

  // Particle float values (one per circle)
  const p0Y = useSharedValue(0)
  const p1Y = useSharedValue(0)
  const p2Y = useSharedValue(0)
  const p3Y = useSharedValue(0)
  const p4Y = useSharedValue(0)
  const p5Y = useSharedValue(0)
  const particleYValues = [p0Y, p1Y, p2Y, p3Y, p4Y, p5Y]

  // ── Animated styles ───────────────────────────────────────────────────────
  const backgroundStyle = useAnimatedStyle(() => ({
    // bgOpacity handles the fade-IN; exitBgOpacity handles the final fade-OUT
    opacity: bgOpacity.value * exitBgOpacity.value,
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

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: titleY.value },
      { scale: titleScale.value },
    ],
    opacity: titleOpacity.value,
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineY.value }],
    opacity: taglineOpacity.value,
  }))

  const exitContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity: exitOpacity.value,
  }))

  const particleStyles = particleYValues.map((pY) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ transform: [{ translateY: pY.value }] }))
  )

  // ── Start sequence ────────────────────────────────────────────────────────
  const startAnimation = useCallback(() => {
    const EASE_OUT = Easing.out(Easing.cubic)
    const EASE_IN  = Easing.in(Easing.cubic)

    // 400ms — background fades IN
    bgOpacity.value = withTiming(1, { duration: 400, easing: EASE_OUT })

    // 300ms — particles begin floating (continuous)
    particleYValues.forEach((pY, i) => {
      pY.value = withDelay(
        300 + i * 80,
        withRepeat(
          withSequence(
            withTiming(-12, { duration: 3000 + i * 400, easing: Easing.inOut(Easing.sin) }),
            withTiming(12,  { duration: 3000 + i * 400, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        ),
      )
    })

    // 600ms — logo circle spring bounce in
    logoScale.value = withDelay(
      600,
      withSpring(1, { damping: 12, stiffness: 180, mass: 0.8 }),
    )

    // 900ms — logo icon rotates 360° once
    logoIconRotate.value = withDelay(
      900,
      withTiming(360, { duration: 600, easing: Easing.inOut(Easing.quad) }),
    )

    // 1100ms — shimmer sweep
    shimmerX.value = withDelay(
      1100,
      withTiming(LOGO_SIZE + 20, { duration: 400, easing: Easing.out(Easing.quad) }),
    )

    // 1300ms — title rises + fades in
    titleY.value = withDelay(
      1300,
      withSpring(0, { damping: 18, stiffness: 120 }),
    )
    titleOpacity.value = withDelay(
      1300,
      withTiming(1, { duration: 400, easing: EASE_OUT }),
    )

    // 1750ms — subtle breathing pulse on title
    titleScale.value = withDelay(
      1750,
      withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.00, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    )

    // 1600ms — tagline fades in
    taglineOpacity.value = withDelay(
      1600,
      withTiming(1, { duration: 500, easing: EASE_OUT }),
    )
    taglineY.value = withDelay(
      1600,
      withTiming(0, { duration: 500, easing: EASE_OUT }),
    )

    // 1900ms — ripple 1
    ripple1Opacity.value = withDelay(
      1900,
      withTiming(0, { duration: 800, easing: EASE_IN }),
    )
    ripple1Scale.value = withDelay(
      1900,
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(2.5, { duration: 800, easing: EASE_IN }),
      ),
    )

    // 2200ms — ripple 2
    ripple2Opacity.value = withDelay(
      2200,
      withTiming(0, { duration: 800, easing: EASE_IN }),
    )
    ripple2Scale.value = withDelay(
      2200,
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(2.5, { duration: 800, easing: EASE_IN }),
      ),
    )

    // 2800ms — exit: content scales up slightly and fades out
    exitScale.value = withDelay(
      2800,
      withTiming(1.06, { duration: 400, easing: EASE_IN }),
    )
    // When content finishes fading, signal that the primary animation is done.
    // Background stays solid — triggerExit() handles the final bg fade separately.
    exitOpacity.value = withDelay(
      2800,
      withTiming(0, { duration: 400, easing: EASE_IN }, (finished) => {
        if (finished) runOnJS(onComplete)()
      }),
    )
  }, [onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Final exit (call this only when ready to navigate) ────────────────────
  // Fades the background to transparent then calls onDone on the JS thread.
  function triggerExit(onDone: () => void) {
    exitBgOpacity.value = withTiming(
      0,
      { duration: 300, easing: Easing.in(Easing.cubic) },
      (finished) => { if (finished) runOnJS(onDone)() },
    )
  }

  return {
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
    startAnimation,
    triggerExit,
    particleConfigs: PARTICLES,
  }
}
