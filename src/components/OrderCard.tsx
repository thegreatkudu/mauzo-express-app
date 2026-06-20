import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CalendarIcon, BuildingIcon } from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import type { Order } from '@/types'

interface OrderCardProps {
  order: Order
  onPress: () => void
}

const OrderCard = memo(function OrderCard({ order, onPress }: OrderCardProps) {
  const firstProduct = order.items[0]?.product?.name ?? '—'
  const extraCount   = order.items.length - 1
  const { rf, isTablet } = useResponsive()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      style={[styles.card, isTablet && styles.cardTablet]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Row 1: order ID + status */}
      <View style={styles.topRow}>
        <Text style={[styles.orderId, { fontSize: rf(14) }]}>{formatOrderId(order.order_id)}</Text>
        <StatusBadge status={order.status} size='sm' />
      </View>

      {/* Row 2: supplier */}
      <View style={styles.metaRow}>
        <HugeiconsIcon icon={BuildingIcon} size={13} color='#9CA3AF' strokeWidth={1.5} />
        <Text style={[styles.metaText, { fontSize: rf(12) }]} numberOfLines={1}>
          {order.supplier.business_name}
        </Text>
      </View>

      {/* Row 3: product summary */}
      <Text style={[styles.product, { fontSize: rf(13) }]} numberOfLines={1}>
        {firstProduct}{extraCount > 0 ? ` ${t('order_card.more', { count: extraCount })}` : ''}
      </Text>

      {/* Row 4: date + total */}
      <View style={styles.bottomRow}>
        <View style={styles.dateRow}>
          <HugeiconsIcon icon={CalendarIcon} size={12} color='#9CA3AF' strokeWidth={1.5} />
          <Text style={[styles.dateText, { fontSize: rf(11) }]}>{formatDate(order.created_at)}</Text>
        </View>
        {order.total_quoted_amount != null && (
          <Text style={[styles.total, { fontSize: rf(13) }]}>
            TZS {order.total_quoted_amount.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
})

export default OrderCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardTablet: {
    marginBottom: 0,
    borderRadius: 18,
    padding: 18,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    flexShrink: 1,
    marginRight: 8,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    flex: 1,
  },

  product: {
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  total: {
    fontFamily: 'Poppins-Bold',
    color: '#CE4002',
  },
})
