/**
 * @file OrderCard.tsx
 * @description Reusable card component that represents a single order in a list.
 *
 * Purpose:
 * - Renders the key identifiers of an order (ID, supplier, product summary, date,
 *   status, and quoted total) in a compact, tappable card.
 * - Used in both the Orders tab's FlashList and anywhere else an order row is
 *   needed (e.g. the home screen's Recent Orders section uses a custom row, but
 *   the Orders tab uses this full card).
 *
 * Animation:
 * - Each card entrance is driven by `FadeInDown` from Reanimated, offset by
 *   `listStagger(index)` ms so cards cascade in from top to bottom rather than
 *   all appearing at once.
 * - The `index` prop must be provided by the parent's `renderItem` for the stagger
 *   to work correctly; it defaults to `0` (no stagger) as a safe fallback.
 *
 * Interactions with the rest of the app:
 * - Rendered by `src/app/(tabs)/orders.tsx` inside a `@shopify/flash-list`.
 * - Navigates to the Order Detail screen (`/order/[id]`) via the `onPress` prop,
 *   keeping navigation logic in the parent rather than hard-coding it here.
 * - Wrapped in `memo` to prevent re-renders when adjacent list items change.
 */

import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { CalendarIcon, BuildingIcon } from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import { spring, listStagger } from '@/constants/animations'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import type { Order } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Props for the OrderCard component.
 *
 * @property order   - The full Order object to render. See `src/types/index.ts`.
 * @property onPress - Callback invoked when the card is tapped; typically
 *                     navigates to the Order Detail screen.
 * @property index   - Zero-based position within the parent list, used to
 *                     compute the staggered entrance delay. Defaults to `0`.
 */
interface OrderCardProps {
  order: Order
  onPress: () => void
  index?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Tappable order summary card with a staggered FadeInDown entrance animation.
 *
 * Layout (top → bottom):
 *   Row 1 — Short order ID (formatted) on the left, status badge on the right.
 *   Row 2 — Supplier business name with a building icon.
 *   Row 3 — First product name, with "+N more" suffix for multi-item orders.
 *   Row 4 — Created date on the left, quoted total (TZS) on the right (if set).
 *
 * The quoted total is only rendered when `order.total_quoted_amount` is not null —
 * orders in the `awaiting_quote` state will not have a total yet.
 *
 * @example
 * // Inside a FlashList renderItem:
 * <OrderCard
 *   order={item}
 *   index={index}
 *   onPress={() => router.push(`/order/${item.order_id}`)}
 * />
 */
const OrderCard = memo(function OrderCard({ order, onPress, index = 0 }: OrderCardProps) {
  // First product name for the summary line; falls back to an em dash if the
  // items array is unexpectedly empty (defensive guard, shouldn't happen in prod).
  const firstProduct = order.items[0]?.product?.name ?? '—'

  // Number of additional items beyond the first, shown as "+2 more".
  const extraCount = order.items.length - 1

  const { rf, isTablet } = useResponsive()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)

  return (
    // Reanimated wrapper drives the staggered entrance.
    // `springify()` converts the FadeInDown to a spring so it stays consistent
    // with the spring.list preset used elsewhere in the app.
    <Animated.View
      entering={FadeInDown
        .delay(listStagger(index, 40))
        .springify()
        .damping(spring.list.damping)
        .stiffness(spring.list.stiffness)}
    >
      <TouchableOpacity
        style={[styles.card, isTablet && styles.cardTablet]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* ── Row 1: Order ID + status ── */}
        <View style={styles.topRow}>
          <Text style={[styles.orderId, { fontSize: rf(14) }]}>
            {formatOrderId(order.order_id)}
          </Text>
          <StatusBadge status={order.status} size='sm' />
        </View>

        {/* ── Row 2: Supplier name ── */}
        <View style={styles.metaRow}>
          <HugeiconsIcon icon={BuildingIcon} size={13} color={theme.colors.textMuted} strokeWidth={1.5} />
          <Text style={[styles.metaText, { fontSize: rf(12) }]} numberOfLines={1}>
            {order.supplier.business_name}
          </Text>
        </View>

        {/* ── Row 3: Product summary ── */}
        <Text style={[styles.product, { fontSize: rf(13) }]} numberOfLines={1}>
          {firstProduct}
          {/* Append "+N more" only when the order contains multiple line items. */}
          {extraCount > 0 ? ` ${t('order_card.more', { count: extraCount })}` : ''}
        </Text>

        {/* ── Row 4: Date + quoted total ── */}
        <View style={styles.bottomRow}>
          <View style={styles.dateRow}>
            <HugeiconsIcon icon={CalendarIcon} size={12} color={theme.colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.dateText, { fontSize: rf(11) }]}>
              {formatDate(order.created_at)}
            </Text>
          </View>
          {/* Only render when a quote has been provided by the supplier. */}
          {order.total_quoted_amount != null && (
            <Text style={[styles.total, { fontSize: rf(13) }]}>
              TZS {order.total_quoted_amount.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
})

export default OrderCard

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      padding:         16,
      marginBottom:    10,
      borderWidth:     1,
      borderColor:     theme.colors.border,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   theme.isDark ? 0 : 0.04,
      shadowRadius:    5,
      elevation:       2,
      gap:             8,
    },
    cardTablet: { marginBottom: 0, borderRadius: 18, padding: 18 },

    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orderId: { fontFamily: 'Poppins-Bold', color: theme.colors.text, flexShrink: 1, marginRight: 8 },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaText: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub, flex: 1 },

    product: { fontFamily: 'Poppins-Medium', color: theme.colors.textSub },

    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    dateRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText:  { fontFamily: 'Poppins-Regular', color: theme.colors.textMuted },
    total:     { fontFamily: 'Poppins-Bold', color: theme.colors.primary },
  })
}
