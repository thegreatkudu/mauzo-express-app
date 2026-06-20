import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useCartStore } from '@/store/cart.store'
import { SparklesIcon, LockIcon } from '@/constants/icons'

interface Props {
  onCheckout: () => void
}

export default function CartSummary({ onCheckout }: Props) {
  const subtotal     = useCartStore(s => s.getSubtotal())
  const discount     = useCartStore(s => s.getDiscount())
  const deliveryFee  = useCartStore(s => s.getDeliveryFee())
  const total        = useCartStore(s => s.getTotal())
  const appliedPromo = useCartStore(s => s.appliedPromo)
  const itemCount    = useCartStore(s => s.getItemCount())

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Order Summary</Text>

      <View style={styles.rows}>
        <SummaryRow label={`Subtotal (${itemCount} items)`} value={`$${subtotal.toFixed(2)}`} />

        {appliedPromo && discount > 0 && (
          <SummaryRow
            label={`Promo (${appliedPromo.code})`}
            value={`-$${discount.toFixed(2)}`}
            valueStyle={styles.discountValue}
          />
        )}

        <SummaryRow
          label='Delivery fee'
          value={deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
          valueStyle={deliveryFee === 0 ? styles.freeValue : undefined}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>

      {discount > 0 && (
        <View style={styles.savingsBanner}>
          <HugeiconsIcon icon={SparklesIcon} size={14} color='#10B981' strokeWidth={1.5} />
          <Text style={styles.savingsText}>
            You're saving ${discount.toFixed(2)} on this order!
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onCheckout}
        activeOpacity={0.88}
        style={styles.checkoutWrap}
      >
        <LinearGradient
          colors={['#B33600', '#CE4002']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkoutBtn}
        >
          <HugeiconsIcon icon={LockIcon} size={16} color='#fff' strokeWidth={1.5} />
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <View style={styles.totalPill}>
            <Text style={styles.totalPillText}>${total.toFixed(2)}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

function SummaryRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 14,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  discountValue: {
    color: '#10B981',
  },
  freeValue: {
    color: '#10B981',
    fontFamily: 'Poppins-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  savingsText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#065F46',
  },
  checkoutWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  totalPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  totalPillText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
})
