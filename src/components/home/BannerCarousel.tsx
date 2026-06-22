import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated, FlatList, StyleSheet,
  TouchableOpacity, View,
  type NativeScrollEvent, type NativeSyntheticEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { BackIcon, ForwardIcon } from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'

// ── Static data ───────────────────────────────────────────────────────────────

type Slide = { id: string; source: number }

const SLIDES: Slide[] = [
  { id: '1', source: require('@/assets/images/slider_one-cover.png')   },
  { id: '2', source: require('@/assets/images/slider_two-cover.png')   },
  { id: '3', source: require('@/assets/images/slider_three-cover.png') },
]

const DATA: Slide[] = [
  { ...SLIDES[SLIDES.length - 1], id: 'clone-last'  },
  ...SLIDES,
  { ...SLIDES[0],                  id: 'clone-first' },
]

const REAL_COUNT      = SLIDES.length
const AUTO_PLAY_MS    = 4_500
const SNAP_DELAY_MS   = 380
const SLIDE_RATIO     = 2.0   // container is 2:1; cover-crop keeps images looking great
const BORDER_RADIUS   = RADIUS.lg   // 18
const ARROW_SIZE      = 34
const DOT_ACTIVE_W    = 22
const DOT_INACTIVE_W  = 6
const DOT_H           = 5
const DOT_GAP         = 5

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onSlidePress?: (slideIndex: number) => void
}

export default function BannerCarousel({ onSlidePress }: Props) {
  const { width: screenWidth, hp, contentMaxWidth } = useResponsive()

  const slideWidth  = contentMaxWidth
    ? Math.min(screenWidth - hp * 2, contentMaxWidth)
    : screenWidth - hp * 2
  const slideHeight = Math.round(slideWidth / SLIDE_RATIO)
  const arrowTop    = Math.round((slideHeight - ARROW_SIZE) / 2)
  const scrimH      = Math.round(slideHeight * 0.52)

  const [realIdx,    setRealIdx]    = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const flatIdxRef     = useRef(1)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef        = useRef<FlatList<Slide>>(null)

  // One Animated.Value per dot — drives width transitions on the JS thread
  const dotAnims = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? DOT_ACTIVE_W : DOT_INACTIVE_W))
  ).current

  // ── Dot animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel(
      SLIDES.map((_, i) =>
        Animated.timing(dotAnims[i], {
          toValue:  i === realIdx ? DOT_ACTIVE_W : DOT_INACTIVE_W,
          duration: 220,
          useNativeDriver: false,
        })
      )
    ).start()
  }, [realIdx])

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDragging || slideWidth <= 0) return

    const timer = setInterval(() => {
      const nextFlat = flatIdxRef.current + 1
      listRef.current?.scrollToOffset({ offset: nextFlat * slideWidth, animated: true })

      if (nextFlat === DATA.length - 1) {
        setRealIdx(0)
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
        snapTimeoutRef.current = setTimeout(() => {
          listRef.current?.scrollToOffset({ offset: slideWidth, animated: false })
          flatIdxRef.current = 1
        }, SNAP_DELAY_MS)
      } else {
        flatIdxRef.current = nextFlat
        setRealIdx(nextFlat - 1)
      }
    }, AUTO_PLAY_MS)

    return () => {
      clearInterval(timer)
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    }
  }, [isDragging, slideWidth])

  // ── Position resolver ──────────────────────────────────────────────────────
  function resolvePosition(offset: number) {
    const flat = Math.round(offset / slideWidth)
    if (flat === 0) {
      listRef.current?.scrollToOffset({ offset: slideWidth * REAL_COUNT, animated: false })
      flatIdxRef.current = REAL_COUNT
      setRealIdx(REAL_COUNT - 1)
    } else if (flat === DATA.length - 1) {
      listRef.current?.scrollToOffset({ offset: slideWidth, animated: false })
      flatIdxRef.current = 1
      setRealIdx(0)
    } else {
      flatIdxRef.current = flat
      setRealIdx(flat - 1)
    }
  }

  // ── Scroll handlers ────────────────────────────────────────────────────────
  function onScrollBeginDrag() { setIsDragging(true) }

  function onScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    resolvePosition(e.nativeEvent.contentOffset.x)
    setIsDragging(false)
  }

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    resolvePosition(e.nativeEvent.contentOffset.x)
  }

  // ── Arrow / dot navigation ─────────────────────────────────────────────────
  function goTo(targetReal: number) {
    const targetFlat = targetReal + 1
    listRef.current?.scrollToOffset({ offset: targetFlat * slideWidth, animated: true })
    flatIdxRef.current = targetFlat
    setRealIdx(targetReal)
  }

  function goPrev() { goTo((realIdx - 1 + REAL_COUNT) % REAL_COUNT) }
  function goNext() { goTo((realIdx + 1) % REAL_COUNT) }

  // ── Slide renderer ─────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item, index }: { item: Slide; index: number }) => {
    const ri = index === 0
      ? REAL_COUNT - 1
      : index >= DATA.length - 1 ? 0 : index - 1
    return (
      <TouchableOpacity activeOpacity={0.97} onPress={() => onSlidePress?.(ri)}>
        <View style={{ width: slideWidth, height: slideHeight, backgroundColor: '#0F172A' }}>
          <Image
            source={item.source}
            style={StyleSheet.absoluteFill}
            contentFit='cover'
            transition={200}
            priority={index <= 2 ? 'high' : 'low'}
          />
        </View>
      </TouchableOpacity>
    )
  }, [slideWidth, slideHeight, onSlidePress])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Outer shell: supplies the shadow (must NOT have overflow:hidden on iOS)
    <View style={[styles.shell, { borderRadius: BORDER_RADIUS }]}>

      {/* Inner shell: clips images to rounded corners */}
      <View style={[styles.inner, { borderRadius: BORDER_RADIUS, height: slideHeight }]}>

        {/* ① Slides */}
        <FlatList
          ref={listRef}
          data={DATA}
          keyExtractor={s => s.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode='never'
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={1}
          scrollEventThrottle={16}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, i) => ({ length: slideWidth, offset: slideWidth * i, index: i })}
          style={{ width: slideWidth }}
          removeClippedSubviews
        />

        {/* ② Gradient scrim — makes arrows and dots readable on any image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.52)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.scrim, { height: scrimH }]}
          pointerEvents='none'
        />

        {/* ③ Left arrow */}
        <TouchableOpacity
          style={[styles.arrow, { left: 12, top: arrowTop }]}
          onPress={goPrev}
          activeOpacity={0.75}
          hitSlop={10}
        >
          <HugeiconsIcon icon={BackIcon} size={14} color='#fff' strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ④ Right arrow */}
        <TouchableOpacity
          style={[styles.arrow, { right: 12, top: arrowTop }]}
          onPress={goNext}
          activeOpacity={0.75}
          hitSlop={10}
        >
          <HugeiconsIcon icon={ForwardIcon} size={14} color='#fff' strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ⑤ Dot indicators — overlaid at bottom-center */}
        <View style={styles.dotsRow} pointerEvents='box-none'>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={8}>
              <Animated.View
                style={[
                  styles.dot,
                  { width: dotAnims[i] },
                  i === realIdx ? styles.dotOn : styles.dotOff,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    // Shadow separated from clip so iOS shadow isn't swallowed by overflow:hidden
    backgroundColor: '#0F172A',   // matches image background on load
    ...SHADOW.lg,
  },

  inner: {
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },

  scrim: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
  },

  arrow: {
    position:        'absolute',
    width:           ARROW_SIZE,
    height:          ARROW_SIZE,
    borderRadius:    ARROW_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.20)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  dotsRow: {
    position:       'absolute',
    bottom:         14,
    left:           0,
    right:          0,
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            DOT_GAP,
  },

  dot: {
    height:       DOT_H,
    borderRadius: RADIUS.full,
  },
  dotOn: {
    backgroundColor: '#ffffff',
  },
  dotOff: {
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
})
