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
const RING_MAX    = 4.8           // maximum scale expansion
const RING_MS     = 2600          // full expansion cycle
const RING_COUNT  = 6             // more rings = denser, more alive
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

// ── CenterGlow ─────────────────────────────────────────────────────────────────
// Soft pulsing filled circle at the ripple origin — gives the rings a focal
// point and makes the center feel alive between ring bursts.

const CenterGlow = memo(function CenterGlow() {
  const opacity = useSharedValue(0.2)
  const scale   = useSharedValue(0.85)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.12, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4,  { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      style={[
        styles.centerGlow,
        animStyle,
      ]}
    />
  )
})

// ── RippleRing ─────────────────────────────────────────────────────────────────

interface RippleRingProps {
  /** Initial delay before the loop starts (ms) */
  startDelay: number
  /** Even-indexed rings use a slightly warmer amber tint for depth layering */
  warm: boolean
}

const RippleRing = memo(function RippleRing({ startDelay, warm }: RippleRingProps) {
  const scale   = useSharedValue(0.05)
  const opacity = useSharedValue(0)

  useEffect(() => {
    const id = setTimeout(() => {
      // Scale: snap to minimum then expand to RING_MAX
      scale.value = withRepeat(
        withSequence(
          withTiming(0.05, { duration: 0 }),
          withTiming(RING_MAX, {
            duration: RING_MS,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        -1,
        false,
      )
      // Opacity: strong burst as the ring materialises, long fade as it expands
      opacity.value = withRepeat(
        withSequence(
          withTiming(warm ? 0.72 : 0.58, { duration: 80 }),
          withTiming(0, {
            duration: RING_MS - 80,
            easing: Easing.out(Easing.quad),
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

  return (
    <Animated.View
      style={[
        styles.ring,
        warm ? styles.ringWarm : styles.ringCool,
        animStyle,
      ]}
    />
  )
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

      {/* ─── Layer 5: Ripple rings + center glow ─── */}
      {/* Continuously looping rings radiating from the logo center, with a
          pulsing glow at the focal point for added depth. */}
      <View style={styles.ringsHost}>
        {/* Center glow renders behind the rings */}
        <CenterGlow />
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <RippleRing
            key={i}
            startDelay={Math.round((RING_MS / RING_COUNT) * i)}
            warm={i % 2 === 0}
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

  orb: { position: 'absolute' },

  // Host anchors all rings and the center glow at the logo center.
  ringsHost: {
    position: 'absolute',
    width:    RING_BASE,
    height:   RING_BASE,
    left:     RING_X,
    top:      RING_Y,
  },

  // Pulsing filled circle — stays at center, behind the rings.
  centerGlow: {
    position:        'absolute',
    width:           RING_BASE,
    height:          RING_BASE,
    borderRadius:    RING_BASE / 2,
    backgroundColor: 'rgba(255, 190, 90, 0.38)',
  },

  // Shared ring geometry
  ring: {
    position:        'absolute',
    width:           RING_BASE,
    height:          RING_BASE,
    borderRadius:    RING_BASE / 2,
    backgroundColor: 'transparent',
  },

  // Alternating ring colors: warm amber vs cool white-gold
  ringWarm: {
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 100, 0.9)',
  },
  ringCool: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 245, 220, 0.85)',
  },
})
