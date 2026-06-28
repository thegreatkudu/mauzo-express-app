import { useCallback, useRef, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import { shadows } from '@/theme'
import {
  GridIcon,
  VendorStoreIcon,
  WishlistIcon,
  TagIcon,
  VerifiedIcon,
  StarIcon,
  CreditCardIcon,
  ClockIcon,
  LocationIcon,
  CheckCircleIcon,
  NotificationIcon,
  BackIcon,
  ForwardIcon,
  BagIcon,
  DeliveryIcon,
  type IconSvgElement,
} from '@/constants/icons'

const { width, height } = Dimensions.get('window')
const CARD_H = Math.round(height * 0.37)

// ─── Types ───────────────────────────────────────────────────────────────────

type Chip = {
  icon: IconSvgElement
  label: string
  top: number
  left?: number
  right?: number
}

type GradientSlide = {
  id: string
  colors: [string, string]
  icon: IconSvgElement
  title: string
  subtitle: string
  chips: Chip[]
}

// ─── Slide data ──────────────────────────────────────────────────────────────

function buildSlides(t: (key: string) => string): GradientSlide[] {
  return [
    {
      id: '1',
      colors: ['#B33600', '#CE4002'],
      icon: VendorStoreIcon as unknown as IconSvgElement,
      title: t('onboarding.slides.0.title'),
      subtitle: t('onboarding.slides.0.subtitle'),
      chips: [
        { icon: GridIcon as unknown as IconSvgElement,        label: '8 Categories',  top: Math.round(height * 0.14), left: 22 },
        { icon: VendorStoreIcon as unknown as IconSvgElement, label: 'Top Vendors',   top: Math.round(height * 0.18), right: 22 },
        { icon: WishlistIcon as unknown as IconSvgElement,    label: 'Wishlists',     top: Math.round(height * 0.49), left: 22 },
        { icon: TagIcon as unknown as IconSvgElement,         label: 'Best Deals',    top: Math.round(height * 0.53), right: 22 },
      ],
    },
    {
      id: '2',
      colors: ['#2c489f', '#312d8a'],
      icon: BagIcon as unknown as IconSvgElement,
      title: t('onboarding.slides.1.title'),
      subtitle: t('onboarding.slides.1.subtitle'),
      chips: [
        { icon: GridIcon as unknown as IconSvgElement,        label: '10K+ Products', top: Math.round(height * 0.14), left: 22 },
        { icon: VerifiedIcon as unknown as IconSvgElement,    label: 'Secure Pay',    top: Math.round(height * 0.18), right: 22 },
        { icon: StarIcon as unknown as IconSvgElement,        label: '4.9 Rating',    top: Math.round(height * 0.49), left: 22 },
        { icon: CreditCardIcon as unknown as IconSvgElement,  label: 'Multi-Pay',     top: Math.round(height * 0.53), right: 22 },
      ],
    },
    {
      id: '3',
      colors: ['#37c0b1', '#2c489f'],
      icon: DeliveryIcon as unknown as IconSvgElement,
      title: t('onboarding.slides.2.title'),
      subtitle: t('onboarding.slides.2.subtitle'),
      chips: [
        { icon: ClockIcon as unknown as IconSvgElement,         label: 'Same Day',      top: Math.round(height * 0.14), left: 22 },
        { icon: LocationIcon as unknown as IconSvgElement,      label: 'Live Tracking', top: Math.round(height * 0.18), right: 22 },
        { icon: CheckCircleIcon as unknown as IconSvgElement,   label: 'On Time',       top: Math.round(height * 0.49), left: 22 },
        { icon: NotificationIcon as unknown as IconSvgElement,  label: 'Live Updates',  top: Math.round(height * 0.53), right: 22 },
      ],
    },
  ]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function markOnboardingSeen() {
  await SecureStore.setItemAsync('mauzo_onboarding_seen', '1')
}

// ─── GradientSlideItem ────────────────────────────────────────────────────────

function GradientSlideItem({ slide }: { slide: GradientSlide }) {
  const SIZE = Math.min(width, height - CARD_H) * 0.72

  return (
    <View style={styles.slide}>
      <LinearGradient colors={slide.colors} style={StyleSheet.absoluteFill} />

      {/* Subtle radial-like glow backdrop */}
      <View style={[styles.glowCircle, {
        width: SIZE * 1.3,
        height: SIZE * 1.3,
        borderRadius: SIZE * 0.65,
        top: (height - CARD_H) / 2 - (SIZE * 1.3) / 2,
        left: width / 2 - (SIZE * 1.3) / 2,
      }]} />

      {/* Concentric rings + icon — centered in visible area above card */}
      <View style={[styles.ringsWrap, { bottom: CARD_H }]}>
        {/* Ring 3 — outermost */}
        <View style={[styles.ring, {
          width: SIZE * 0.88, height: SIZE * 0.88,
          borderRadius: SIZE * 0.44,
          top: (SIZE - SIZE * 0.88) / 2,
          left: (SIZE - SIZE * 0.88) / 2,
          borderColor: 'rgba(255,255,255,0.10)',
        }]} />
        {/* Ring 2 */}
        <View style={[styles.ring, {
          width: SIZE * 0.66, height: SIZE * 0.66,
          borderRadius: SIZE * 0.33,
          top: (SIZE - SIZE * 0.66) / 2,
          left: (SIZE - SIZE * 0.66) / 2,
          borderColor: 'rgba(255,255,255,0.16)',
        }]} />
        {/* Ring 1 — innermost halo */}
        <View style={[styles.ring, {
          width: SIZE * 0.48, height: SIZE * 0.48,
          borderRadius: SIZE * 0.24,
          top: (SIZE - SIZE * 0.48) / 2,
          left: (SIZE - SIZE * 0.48) / 2,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.22)',
        }]} />

        {/* Central glassmorphism icon card */}
        <View style={[styles.iconCard, {
          width: SIZE * 0.31,
          height: SIZE * 0.31,
          borderRadius: SIZE * 0.08,
          top: (SIZE - SIZE * 0.31) / 2,
          left: (SIZE - SIZE * 0.31) / 2,
        }]}>
          <HugeiconsIcon icon={slide.icon} size={Math.round(SIZE * 0.14)} color='#fff' strokeWidth={1.5} />
        </View>
      </View>

      {/* Floating feature chips */}
      {slide.chips.map((chip, i) => (
        <View
          key={i}
          style={[
            styles.chip,
            { top: chip.top },
            chip.left  !== undefined && { left: chip.left },
            chip.right !== undefined && { right: chip.right },
          ]}
        >
          <View style={styles.chipIconWrap}>
            <HugeiconsIcon icon={chip.icon} size={12} color='#fff' strokeWidth={1.5} />
          </View>
          <Text style={styles.chipText}>{chip.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const SLIDES = buildSlides(t)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<FlatList>(null)
  const insets = useSafeAreaInsets()

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const idx = viewableItems[0]?.index
    if (idx !== null && idx !== undefined) setActiveIndex(idx)
  }, [])

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const scrollTo = (index: number) =>
    listRef.current?.scrollToIndex({ index, animated: true })

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollTo(activeIndex + 1)
    } else {
      markOnboardingSeen().finally(() => router.replace('/(auth)/signin'))
    }
  }

  const skipOnboarding = () => {
    markOnboardingSeen().finally(() => router.replace('/(auth)/signin'))
  }

  const goPrev = () => {
    if (activeIndex > 0) scrollTo(activeIndex - 1)
  }

  const isFirst = activeIndex === 0
  const isLast  = activeIndex === SLIDES.length - 1

  return (
    <View style={styles.root}>

      {/* ── Slides ── */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <GradientSlideItem slide={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* ── Skip button (top-right, hides on last slide) ── */}
      {!isLast && (
        <TouchableOpacity
          onPress={skipOnboarding}
          style={[styles.skipBtn, { top: insets.top + 14 }]}
          hitSlop={8}
          activeOpacity={0.8}
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* ── Bottom card ── */}
      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>

        {/* Progress bars */}
        <View style={styles.progressRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => scrollTo(i)} hitSlop={8} activeOpacity={0.8}>
              <View style={[
                styles.progressBar,
                i === activeIndex ? styles.progressBarActive : styles.progressBarInactive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Text */}
        <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
        <Text style={styles.subtitle}>{SLIDES[activeIndex].subtitle}</Text>

        {/* Action row */}
        <View style={styles.actionRow}>

          {/* Back button — invisible on first slide */}
          <TouchableOpacity
            onPress={goPrev}
            style={[styles.prevBtn, isFirst && styles.prevBtnHidden]}
            hitSlop={8}
            activeOpacity={0.7}
            disabled={isFirst}
          >
            <HugeiconsIcon icon={BackIcon} size={22} color='#CE4002' strokeWidth={2} />
          </TouchableOpacity>

          {/* Next / Get started */}
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.85}
            style={styles.nextBtnWrapper}
          >
            <LinearGradient
              colors={['#B33600', '#CE4002']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextBtnText}>{isLast ? t('onboarding.get_started') : t('onboarding.next')}</Text>
              <HugeiconsIcon icon={ForwardIcon} size={18} color='#fff' strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* Sign-in nudge on last slide */}
        {isLast && (
          <TouchableOpacity
            onPress={skipOnboarding}
            style={styles.signinRow}
            hitSlop={8}
          >
            <Text style={styles.signinPrompt}>{t('onboarding.already_have_account')} </Text>
            <Text style={styles.signinLink}>{t('onboarding.sign_in')}</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  slide: {
    width,
    height,
  },

  // ── Gradient slide ──
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ringsWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  iconCard: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 40,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },

  // ── Skip button ──
  skipBtn: {
    position: 'absolute',
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },

  // ── Bottom card ──
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    ...shadows.heavy,
  },

  // ── Progress bars ──
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    width: 32,
    backgroundColor: '#CE4002',
  },
  progressBarInactive: {
    width: 10,
    backgroundColor: '#E5E7EB',
  },

  // ── Card text ──
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 22,
  },

  // ── Action row ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  prevBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  prevBtnHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  nextBtnWrapper: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 26,
    overflow: 'hidden',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 26,
    gap: 6,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },

  // ── Sign-in nudge ──
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signinPrompt: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  signinLink: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
})
