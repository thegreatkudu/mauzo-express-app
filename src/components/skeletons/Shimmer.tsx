import { createContext, memo, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import {
  Animated, Dimensions, StyleSheet, View, type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width: SCREEN_W } = Dimensions.get('window')
const SHIMMER_W = Math.round(SCREEN_W * 0.5)

const BASE_COLOR    = '#E8EAED'
const BASE_ALPHA    = 'rgba(232,234,237,0)'
const HIGHLIGHT     = 'rgba(255,255,255,0.82)'
const SHIMMER_COLORS: readonly [string, string, string] = [BASE_ALPHA, HIGHLIGHT, BASE_ALPHA]

// Module-level default so context always has a value even without a Provider
const _default = new Animated.Value(0)

const ShimmerCtx = createContext<Animated.Value>(_default)

export function ShimmerProvider({ children }: { children: ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [anim])

  return <ShimmerCtx.Provider value={anim}>{children}</ShimmerCtx.Provider>
}

export const SkeletonBox = memo(function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}) {
  const anim = useContext(ShimmerCtx)

  const translateX = useMemo(
    () =>
      anim.interpolate({
        inputRange:  [0, 1],
        outputRange: [-SHIMMER_W, SCREEN_W + SHIMMER_W],
      }),
    [anim]
  )

  return (
    <View
      style={[
        {
          width:           width as any,
          height,
          borderRadius,
          backgroundColor: BASE_COLOR,
          overflow:        'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position:  'absolute',
          top:       0,
          left:      0,
          width:     SHIMMER_W,
          height:    '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={SHIMMER_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  )
})
