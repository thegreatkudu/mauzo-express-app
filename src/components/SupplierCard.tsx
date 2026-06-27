import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import {
  BuildingIcon, LocationIcon, PackageIcon, ChevronRightIcon,
} from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import type { Supplier } from '@/types'

interface SupplierCardProps {
  supplier: Supplier
  onPress: () => void
  /** True when card is inside a multi-column grid — uses tighter layout */
  compact?: boolean
}

// Category → accent colour mapping for the header bands (empty → falls back to brand orange)
const ACCENT_COLORS: Record<string, { bg: string; icon: string; text: string }> = {}

const SupplierCard = memo(function SupplierCard({
  supplier,
  onPress,
  compact = false,
}: SupplierCardProps) {
  const { rf } = useResponsive()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)

  const accent = ACCENT_COLORS[supplier.category.name] ?? {
    bg:   theme.colors.primaryLight,
    icon: theme.colors.primary,
    text: theme.colors.primary,
  }

  // Header band height scales with compact mode (mirrors product image sizing)
  const bandHeight = compact ? 90 : 110

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* ── Coloured header band (mirrors product image area) ── */}
      <View style={[styles.band, { height: bandHeight, backgroundColor: accent.bg }]}>
        {/* Category chip — top-left */}
        <View style={styles.categoryChip}>
          <Text style={[styles.categoryChipText, { fontSize: rf(10) }]} numberOfLines={1}>
            {supplier.category.name}
          </Text>
        </View>

        {/* Centred building icon */}
        <View style={styles.bandIconWrap}>
          <View style={[styles.bandIconCircle, compact && styles.bandIconCircleCompact]}>
            <HugeiconsIcon
              icon={BuildingIcon}
              size={compact ? 22 : 28}
              color={accent.icon}
              strokeWidth={1.5}
            />
          </View>
        </View>

        {/* Product count badge — bottom-right */}
        <View style={styles.productBadge}>
          <HugeiconsIcon icon={PackageIcon} size={10} color={theme.colors.textSub} strokeWidth={1.5} />
          <Text style={[styles.productBadgeText, { fontSize: rf(10) }]}>
            {t(
              supplier.product_count !== 1
                ? 'supplier_card.products_other'
                : 'supplier_card.products_one',
              { count: supplier.product_count },
            )}
          </Text>
        </View>
      </View>

      {/* ── Card body ── */}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        {/* Business name */}
        <Text
          style={[styles.name, compact && styles.nameCompact, { fontSize: rf(compact ? 13 : 14) }]}
          numberOfLines={1}
        >
          {supplier.business_name}
        </Text>

        {/* Location row */}
        <View style={styles.locationRow}>
          <HugeiconsIcon icon={LocationIcon} size={12} color={theme.colors.textMuted} strokeWidth={1.5} />
          <Text
            style={[styles.location, { fontSize: rf(11) }]}
            numberOfLines={1}
          >
            {supplier.location}
          </Text>
        </View>

        {/* Browse CTA */}
        <View style={[styles.cta, compact && styles.ctaCompact]}>
          <Text style={[styles.ctaText, { fontSize: rf(12) }]}>
            {t('supplier_card.browse')}
          </Text>
          <HugeiconsIcon icon={ChevronRightIcon} size={13} color='#CE4002' strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  )
})

export default SupplierCard

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
    },
    cardCompact: { marginBottom: 0 },

    band: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },

    categoryChip: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.90)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    categoryChipText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },

    bandIconWrap: { alignItems: 'center', justifyContent: 'center' },
    bandIconCircle: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: theme.colors.card,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    bandIconCircleCompact: { width: 44, height: 44, borderRadius: 22 },

    productBadge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.90)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    productBadgeText: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub },

    body:        { padding: 12, gap: 5 },
    bodyCompact: { padding: 10, gap: 4 },

    name:        { fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    nameCompact: {},

    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    location:    { fontFamily: 'Poppins-Regular', color: theme.colors.textMuted, flex: 1 },

    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      paddingVertical: 8,
      marginTop: 4,
      backgroundColor: 'transparent',
    },
    ctaCompact: { paddingVertical: 6, marginTop: 2 },
    ctaText:    { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },
  })
}
