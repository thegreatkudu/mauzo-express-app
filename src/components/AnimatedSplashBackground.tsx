/**
 * AnimatedSplashBackground
 *
 * Reusable full-screen animated background component designed for splash and
 * auth screens. Provides the visual "world" beneath the SplashOverlay: a rich
 * layered gradient with ambient orbs and continuously looping ripple rings.
 *
 * Architecture — rendered back-to-front:
 *   1. GradientBase    — diagonal rich gradient (matches SplashOverlay exactly)
 *   2. TopHighlight    — radial-like brightening near top-center
 *   3. BottomVignette  — darkening at the base for perceived depth
 *   4. AmbientOrb × 3 — large soft glow circles that slowly float
 *   5. RippleLayer     — 4 staggered rings that continuously expand from center
 *   6. children        — optional content slot
 *
 * Performance contract:
 *   - Animations touch only `transform` and `opacity` (zero layout recalculations)
 *   - All shared values live on the UI thread via Reanimated worklets
 *   - No blur effects (Android overdraw sensitivity)
 *   - Sub-components are frozen with React.memo
 */

import React, { memo, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

// ── Constants ──────────────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get('window')

// Gradient palette — intentionally identical to SplashOverlay so there is
// zero visual difference when the overlay's masterOpacity transitions 0 → 1.
const BASE_COLORS: [string, string, string] = ['#8C2800', '#CE4002', '#E8621A']

// Ripple geometry.
// Rings are centered where SplashOverlay's logo sits: screen center minus
// half of the overlay's paddingBottom (40 / 2 = 20 px).
const RING_BASE   = 96            // diameter at scale 1
const RING_MAX    = 4.2           // maximum scale expansion
const RING_MS     = 3000          // full expansion takes this long
const RING_COUNT  = 4
const RING_X      = W / 2 - RING_BASE / 2
const RING_Y      = H / 2 - 20 - RING_BASE / 2

// Ambient orb configs — placed off-center so they create asymmetric depth.
// Colors are darker/lighter variants of the brand gradient.
const ORBS = [
  // Top-left anchor — deep, anchors the dark corner
  { cx: W * 0.10, cy: H * 0.14, size: 230, color: 'rgba(90, 22, 0, 0.28)',  drift: 14, period: 5000, delay:    0 },
  // Bottom-right relief — lighter, open warmth
  { cx: W * 0.90, cy: H * 0.80, size: 270, color: 'rgba(218, 85, 15, 0.18)', drift: 18, period: 4600, delay: 1500 },
  // Center-right accent — mid-tone, ties the two together
  { cx: W * 0.78, cy: H * 0.35, size: 160, color: 'rgba(150, 42, 0, 0.16)',  drift: 10, period: 5400, delay:  800 },
] as const

// ── RippleRing ─────────────────────────────────────────────────────────────────

interface RippleRingProps {
  /** Initial delay before the loop starts (ms) */
  startDelay: number
}

const RippleRing = memo(function RippleRing({ startDelay }: RippleRingProps) {
  const scale   = useSharedValue(0.08)
  const opacity = useSharedValue(0)

  useEffect(() => {
    const id = setTimeout(() => {
      // Scale: instantly snap to minimum, then expand continuously to RING_MAX.
      scale.value = withRepeat(
        withSequence(
          withTiming(0.08, { duration: 0 }),
          withTiming(RING_MAX, {
            duration: RING_MS,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        -1,
        false,
      )
      // Opacity: flash bright as the ring materialises, then fade as it expands.
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.42, { duration: 100 }),
          withTiming(0, {
            duration: RING_MS - 100,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        -1,
        false,
      )
    }, startDelay)

    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }))

  return <Animated.View style={[styles.ring, animStyle]} />
})

// ── AmbientOrb ─────────────────────────────────────────────────────────────────

interface AmbientOrbProps {
  cx:     number   // horizontal center, px
  cy:     number   // vertical center, px
  size:   number   // diameter, px
  color:  string   // rgba color string
  drift:  number   // max translateY, px
  period: number   // full float cycle, ms
  delay:  number   // start delay, ms
}

const AmbientOrb = memo(function AmbientOrb({
  cx, cy, size, color, drift, period, delay,
}: AmbientOrbProps) {
  const ty = useSharedValue(0)

  useEffect(() => {
    const id = setTimeout(() => {
      // Slow vertical drift — sine easing gives organic breathing feel.
      ty.value = withRepeat(
        withSequence(
          withTiming(-drift, { duration: period / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming( drift, { duration: period / 2, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      )
    }, delay)

    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }))

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width:           size,
          height:          size,
          borderRadius:    size / 2,
          backgroundColor: color,
          left:            cx - size / 2,
          top:             cy - size / 2,
        },
        animStyle,
      ]}
    />
  )
})

// ── AnimatedSplashBackground ───────────────────────────────────────────────────

interface AnimatedSplashBackgroundProps {
  children?: React.ReactNode
}

export default memo(function AnimatedSplashBackground({
  children,
}: AnimatedSplashBackgroundProps) {
  return (
    <View style={styles.root}>

      {/* ─── Layer 1: Base gradient ─── */}
      <LinearGradient
        colors={BASE_COLORS}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Layer 2: Top-center highlight ─── */}
      {/* Simulates a soft radial brightening near the logo area without blur */}
      <LinearGradient
        colors={['rgba(255, 165, 80, 0.22)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.48 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Layer 3: Bottom vignette ─── */}
      {/* Darkens the lower portion to create perceived depth */}
      <LinearGradient
        colors={['transparent', 'rgba(50, 12, 0, 0.38)']}
        start={{ x: 0.5, y: 0.52 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Layer 4: Ambient orbs ─── */}
      {/* Three large, soft glow circles with independent float rhythms */}
      {ORBS.map((orb, i) => (
        <AmbientOrb key={i} {...orb} />
      ))}

      {/* ─── Layer 5: Ripple rings ─── */}
      {/* Four continuously looping rings that radiate from the logo center */}
      <View style={styles.ringsHost}>
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <RippleRing
            key={i}
            startDelay={(RING_MS / RING_COUNT) * i}
          />
        ))}
      </View>

      {/* ─── Layer 6: Optional content ─── */}
      {children}

    </View>
  )
})

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Solid fallback visible for ~1 frame before the gradient paints.
    // Matches the midpoint of BASE_COLORS so no perceptible difference.
    backgroundColor: '#CE4002',
  },

  orb: {
    position: 'absolute',
  },

  // Host anchors all rings at the logo center position.
  // Each ring is positioned {top:0, left:0} (absolute default) within the host,
  // filling the RING_BASE × RING_BASE area. React Native scales from the
  // view's center by default, so all rings expand outward symmetrically.
  ringsHost: {
    position: 'absolute',
    width:    RING_BASE,
    height:   RING_BASE,
    left:     RING_X,
    top:      RING_Y,
  },

  ring: {
    position:        'absolute',
    width:           RING_BASE,
    height:          RING_BASE,
    borderRadius:    RING_BASE / 2,
    borderWidth:     1.5,
    borderColor:     'rgba(255, 248, 238, 0.34)',
    backgroundColor: 'transparent',
  },
})
