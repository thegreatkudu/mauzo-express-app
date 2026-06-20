import { StyleSheet, Text, View } from 'react-native'
import type { OrderStatus } from '@/types'

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  awaiting_quote:  { label: 'Awaiting Quote',  bg: '#F0F0F0', text: '#6B7280' },
  quote_received:  { label: 'Quote Received',  bg: '#FEF3C7', text: '#D97706' },
  accepted:        { label: 'Accepted',        bg: '#D1FAE5', text: '#059669' },
  rejected:        { label: 'Rejected',        bg: '#FEE2E2', text: '#DC2626' },
  dispatched:      { label: 'Dispatched',      bg: '#EDE9FE', text: '#7C3AED' },
  delivered:       { label: 'Delivered',       bg: '#DBEAFE', text: '#2563EB' },
  closed:          { label: 'Closed',          bg: '#F0F0F0', text: '#6B7280' },
  cancelled:       { label: 'Cancelled',       bg: '#FEE2E2', text: '#DC2626' },
}

interface StatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? { label: status, bg: '#F0F0F0', text: '#6B7280' }

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.text, { color: cfg.text }, size === 'sm' && styles.textSm]}>
        {cfg.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  textSm: {
    fontSize: 10,
  },
})
