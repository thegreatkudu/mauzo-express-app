import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Banner } from '@/types'
import { ForwardIcon } from '@/constants/icons'
import { COLORS, FONT, RADIUS, SHADOW } from '@/constants/theme'

const { width } = Dimensions.get('window')
const SLIDE_W  = width - 32          // 16px margin each side
const SLIDE_H  = Math.round(SLIDE_W * 0.52)
const AUTO_PLAY_MS = 4000

interface Props {
  banners: Banner[]
  onBannerPress?: (banner: Banner) => void
}

// ── Single slide ──────────────────────────────────────────────────────────────
function BannerSlide({ item, onPress }: { item: Banner; onPress?: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  function onPressIn()  { Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start() }
  function onPressOut() { Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start() }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.slide, { transform: [{ scale: scaleAnim }] }]}>
        {item.image ? (
          <ImageBackground source={item.image} style={styles.imageBg} resizeMode='cover'>
            {/* dark gradient overlay */}
            <LinearGradient
              colors={[item.gradientColors[0] + 'CC', item.gradientColors[1] + 'EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <SlideContent item={item} />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={item.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFallback}
          >
            {/* decorative circles */}
            <View style={[styles.circle, { width: 200, height: 200, top: -70, right: -50 }]} />
            <View style={[styles.circle, { width: 130, height: 130, bottom: -40, right: 70 }]} />
            <SlideContent item={item} />
          </LinearGradient>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

function SlideContent({ item }: { item: Banner }) {
  return (
    <View style={styles.content}>
      {/* badge pill */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>

      {/* title */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>

      {/* CTA */}
      <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
        <Text style={styles.ctaText}>{item.ctaText}</Text>
        <HugeiconsIcon icon={ForwardIcon} size={13} color='#fff' strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  )
}

// ── Carousel ──────────────────────────────────────────────────────────────────
export default function HeroBannerCarousel({ banners, onBannerPress }: Props) {
  const [active, setActive] = useState(0)
  const listRef = useRef<FlatList<Banner>>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActive(viewableItems[0].index)
  }, [])

  // auto-play
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % banners.length
        listRef.current?.scrollToIndex({ index: next, animated: true })
        return next
      })
    }, AUTO_PLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [banners.length])

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={b => b.id}
        renderItem={({ item }) => (
          <BannerSlide item={item} onPress={() => onBannerPress?.(item)} />
        )}
        horizontal
        pagingEnabled
        snapToInterval={SLIDE_W + 12}
        snapToAlignment='start'
        decelerationRate='fast'
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        getItemLayout={(_, index) => ({ length: SLIDE_W + 12, offset: (SLIDE_W + 12) * index, index })}
      />

      {/* pagination dots */}
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <TouchableOpacity
            key={i}
            hitSlop={6}
            onPress={() => {
              listRef.current?.scrollToIndex({ index: i, animated: true })
              setActive(i)
            }}
          >
            <Animated.View style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {},

  /* ── slide ── */
  slide: {
    width: SLIDE_W,
    height: SLIDE_H,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  imageBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientFallback: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  /* ── content ── */
  content: {
    padding: 20,
    paddingBottom: 22,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
    marginBottom: 16,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FONT.semiBold,
  },

  /* ── dots ── */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
  dot: {
    height: 5,
    borderRadius: RADIUS.full,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 5,
    backgroundColor: COLORS.borderMed,
  },
})
