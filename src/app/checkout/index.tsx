import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useCartStore } from '@/store/cart.store'
import { CATEGORY_META } from '@/data/mock'
import {
  CATEGORY_ICON_MAP,
  DEFAULT_CATEGORY_ICON,
  BackIcon,
  TickIcon,
  LocationIcon,
  BagIcon,
  CreditCardIcon,
  ReceiptIcon,
  SparklesIcon,
  LockIcon,
  VerifiedIcon,
} from '@/constants/icons'

export default function CheckoutScreen() {
  const vendorGroups  = useCartStore(s => s.getVendorGroups())
  const subtotal      = useCartStore(s => s.getSubtotal())
  const discount      = useCartStore(s => s.getDiscount())
  const deliveryFee   = useCartStore(s => s.getDeliveryFee())
  const total         = useCartStore(s => s.getTotal())
  const appliedPromo  = useCartStore(s => s.appliedPromo)
  const itemCount     = useCartStore(s => s.getItemCount())

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={20} color='#111827' strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* progress indicator */}
        <View style={styles.progress}>
          {['Bag', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <View key={step} style={styles.progressStep}>
              <View style={[styles.progressDot, i === 1 && styles.progressDotActive, i === 0 && styles.progressDotDone]}>
                {i === 0
                  ? <HugeiconsIcon icon={TickIcon} size={12} color='#fff' strokeWidth={2} />
                  : <Text style={[styles.progressNum, i === 1 && styles.progressNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.progressLabel, i === 1 && styles.progressLabelActive]}>{step}</Text>
              {i < 3 && <View style={[styles.progressLine, i === 0 && styles.progressLineDone]} />}
            </View>
          ))}
        </View>

        {/* delivery address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <HugeiconsIcon icon={LocationIcon} size={18} color='#CE4002' strokeWidth={1.5} />
            </View>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
              <Text style={styles.cardAction}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>John Doe</Text>
            <Text style={styles.addressLine}>123 Main Street, Nairobi</Text>
            <Text style={styles.addressLine}>Nairobi County, 00100 · Kenya</Text>
            <Text style={styles.addressPhone}>+254 700 000 000</Text>
          </View>
        </View>

        {/* order items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <HugeiconsIcon icon={BagIcon} size={18} color='#CE4002' strokeWidth={1.5} />
            </View>
            <Text style={styles.cardTitle}>Order Items ({itemCount})</Text>
          </View>
          {vendorGroups.map(group => (
            <View key={group.vendorId}>
              <Text style={styles.vendorLabel}>{group.vendorName}</Text>
              {group.items.map(item => {
                const meta = CATEGORY_META[item.product.category] ?? { color: '#CE4002', icon: 'bag-outline', bg: '#FEF0E6' }
                return (
                  <View key={item._id} style={styles.orderItem}>
                    <View style={[styles.orderThumb, { backgroundColor: meta.color + '18' }]}>
                      <HugeiconsIcon
                        icon={CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON}
                        size={20}
                        color={meta.color}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName} numberOfLines={1}>{item.product.name}</Text>
                      {item.variant?.size  && <Text style={styles.orderItemMeta}>Size: {item.variant.size}</Text>}
                      {item.variant?.color && <Text style={styles.orderItemMeta}>Color: {item.variant.color}</Text>}
                    </View>
                    <View style={styles.orderItemRight}>
                      <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                      <Text style={styles.orderItemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ))}
        </View>

        {/* payment method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <HugeiconsIcon icon={CreditCardIcon} size={18} color='#CE4002' strokeWidth={1.5} />
            </View>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
              <Text style={styles.cardAction}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentRow}>
            <View style={styles.paymentCard}>
              <HugeiconsIcon icon={CreditCardIcon} size={18} color='#4285F4' strokeWidth={1.5} />
              <Text style={styles.paymentLabel}>M-Pesa</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>Default</Text>
            </View>
          </View>
        </View>

        {/* order summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <HugeiconsIcon icon={ReceiptIcon} size={18} color='#CE4002' strokeWidth={1.5} />
            </View>
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryRows}>
            <SummaryRow label={`Subtotal (${itemCount} items)`} value={`$${subtotal.toFixed(2)}`} />
            {appliedPromo && discount > 0 && (
              <SummaryRow label={`Discount (${appliedPromo.code})`} value={`-$${discount.toFixed(2)}`} green />
            )}
            <SummaryRow
              label='Delivery fee'
              value={deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
              green={deliveryFee === 0}
            />
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.savingsBanner}>
              <HugeiconsIcon icon={SparklesIcon as any} size={13} color='#10B981' strokeWidth={1.5} />
              <Text style={styles.savingsText}>You're saving ${discount.toFixed(2)} on this order!</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* place order CTA */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.88} style={styles.placeOrderWrap}>
          <LinearGradient
            colors={['#B33600', '#CE4002']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.placeOrderBtn}
          >
            <HugeiconsIcon icon={LockIcon} size={17} color='#fff' strokeWidth={1.5} />
            <Text style={styles.placeOrderText}>Place Order</Text>
            <View style={styles.placeOrderPill}>
              <Text style={styles.placeOrderPillText}>${total.toFixed(2)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.footerNoteRow}>
          <HugeiconsIcon icon={VerifiedIcon} size={11} color='#9CA3AF' strokeWidth={1.5} />
          <Text style={styles.footerNote}>Secured with 256-bit encryption</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

function SummaryRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={[styles.summaryRowValue, green && styles.summaryRowGreen]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* nav */
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },

  /* scroll */
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },

  /* progress */
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  progressStep: {
    alignItems: 'center',
    position: 'relative',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#CE4002',
  },
  progressDotDone: {
    backgroundColor: '#10B981',
  },
  progressNum: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
  },
  progressNumActive: {
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    marginTop: 4,
  },
  progressLabelActive: {
    color: '#CE4002',
  },
  progressLine: {
    position: 'absolute',
    top: 14,
    left: 30,
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  progressLineDone: {
    backgroundColor: '#10B981',
  },

  /* card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  cardAction: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },

  /* address */
  addressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 2,
  },
  addressName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  addressPhone: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#CE4002',
    marginTop: 4,
  },

  /* vendor / order items */
  vendorLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  orderThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  orderItemInfo: {
    flex: 1,
    gap: 2,
  },
  orderItemName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  orderItemMeta: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  orderItemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  orderItemQty: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  orderItemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },

  /* payment */
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  paymentBadge: {
    backgroundColor: '#FEF0E6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },

  /* summary */
  summaryRows: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  summaryRowValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  summaryRowGreen: {
    color: '#10B981',
    fontFamily: 'Poppins-Bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 22,
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
  },
  savingsText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#065F46',
  },

  /* footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  placeOrderWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  placeOrderText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  placeOrderPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  placeOrderPillText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
})
