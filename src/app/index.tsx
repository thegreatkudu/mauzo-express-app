import AnimatedSplashBackground from '@/components/AnimatedSplashBackground'

// Placeholder route required by Expo Router to anchor the root Stack.
// AnimatedSplashBackground provides the visual base layer that shows through
// SplashOverlay's Animated.View while masterOpacity transitions 0 → 1 during
// the entrance animation (~380 ms). Matching gradient + ambient motion ensures
// the fade-in from background → full overlay is visually seamless.
export default function Index() {
  return <AnimatedSplashBackground />
}
