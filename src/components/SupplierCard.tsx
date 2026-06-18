import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { BuildingIcon, LocationIcon, PackageIcon, ChevronRightIcon } from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import type { Supplier } from '@/types'

interface SupplierCardProps {
  supplier: Supplier
  onPress: () => void
  /** True when card is inside a multi-column grid — uses tighter layout */
  compact?: boolean
}

const SupplierCard = memo(function SupplierCard({ supplier, onPress, compact = false }: SupplierCardProps) {
  const { rf } = useResponsive()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Avatar + business info */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={[styles.avatar, compact && styles.avatarCompact]}>
          <HugeiconsIcon
            icon={BuildingIcon}
            size={compact ? 18 : 22}
            color='#CE4002'
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[styles.name, { fontSize: rf(compact ? 14 : 15) }]}
            numberOfLines={1}
          >
            {supplier.business_name}
          </Text>
          <View style={styles.locationRow}>
            <HugeiconsIcon icon={LocationIcon} size={12} color='#9CA3AF' strokeWidth={1.5} />
            <Text
              style={[styles.location, { fontSize: rf(11) }]}
              numberOfLines={1}
            >
              {supplier.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Category chip + product count */}
      <View style={[styles.meta, compact && styles.metaCompact]}>
        <View style={styles.chip}>
          <Text style={[styles.chipText, { fontSize: rf(11) }]}>
            {supplier.category.name}
          </Text>
        </View>
        <View style={styles.productCount}>
          <HugeiconsIcon icon={PackageIcon} size={12} color='#6B7280' strokeWidth={1.5} />
          <Text style={[styles.productCountText, { fontSize: rf(11) }]}>
            {t(
              supplier.product_count !== 1
                ? 'supplier_card.products_other'
                : 'supplier_card.products_one',
              { count: supplier.product_count }
            )}
          </Text>
        </View>
      </View>

      {/* Browse CTA */}
      <View style={[styles.btn, compact && styles.btnCompact]}>
        <Text style={[styles.btnText, { fontSize: rf(12) }]}>{t('supplier_card.browse')}</Text>
        <HugeiconsIcon icon={ChevronRightIcon} size={14} color='#CE4002' strokeWidth={2} />
      </View>
    </TouchableOpacity>
  )
})

export default SupplierCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompact: {
    padding: 12,
    marginBottom: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerCompact: {
    gap: 8,
    marginBottom: 10,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarCompact: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },

  headerText: { flex: 1, gap: 3 },
  name: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    flex: 1,
  },

  // Meta row
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaCompact: { marginBottom: 10 },

  chip: {
    backgroundColor: '#FEF0E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
  productCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productCountText: {
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },

  // Browse CTA — now a View (card itself is the touchable)
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#CE4002',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  btnCompact: { paddingVertical: 8 },
  btnText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
})
