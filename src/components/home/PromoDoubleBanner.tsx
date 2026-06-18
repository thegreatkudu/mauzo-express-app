import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { SparklesIcon, SaleTag01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@/constants/icons'
import { ForwardIcon } from '@/constants/icons'
import { COLORS, FONT, RADIUS, SPACING } from '@/constants/theme'
import { shadowStyles } from '@/theme'
import { PromoBanner } from '@/data/mock'

const PROMO_ICONS: Record<string, IconSvgElement> = {
  p1: SparklesIcon as unknown as IconSvgElement,
  p2: SaleTag01Icon as unknown as IconSvgElement,
}

const GRADIENTS: Record<string, [string, string]> = {
  p1: [COLORS.primary, '#c40060'],
  p2: [COLORS.indigo,  '#1a2d6b'],
}

interface Props {
  banners: PromoBanner[]
  onPress?: (banner: PromoBanner) => void
}

export default function PromoDoubleBanner({ banners, onPress }: Props) {
  return (
    <View style={styles.row}>
      {banners.map(banner => (
        <TouchableOpacity
          key={banner.id}
          style={styles.card}
          onPress={() => onPress?.(banner)}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={GRADIENTS[banner.id] ?? [COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* decorative ring */}
            <View style={styles.decorRing} />
            <View style={styles.decorRingSmall} />

            {/* icon */}
            <View style={styles.iconWrap}>
              <HugeiconsIcon
                icon={PROMO_ICONS[banner.id]}
                size={24}
                color='rgba(255,255,255,0.9)'
                strokeWidth={1.5}
              />
            </View>

            {/* text */}
            <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
            <Text style={styles.sub} numberOfLines={2}>{banner.subtitle}</Text>

            {/* cta row */}
            <View style={styles.ctaRow}>
              <Text style={styles.ctaText}>{banner.ctaText}</Text>
              <HugeiconsIcon icon={ForwardIcon as unknown as IconSvgElement} size={12} color='#fff' strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.page,
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...shadowStyles.product,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    overflow: 'hidden',
    minHeight: 148,
    justifyContent: 'flex-end',
  },
  decorRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 22,
    borderColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -28,
  },
  decorRingSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: 30,
    right: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#fff',
    marginBottom: 2,
  },
  sub: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 15,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: '#fff',
  },
})
