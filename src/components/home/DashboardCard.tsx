/**
 * @file DashboardCard.tsx
 * @description Hero gradient card displayed at the top of the Home screen's
 *              "Order Overview" section.
 *
 * Purpose:
 * - Gives the buyer an immediate, at-a-glance view of their active order workload.
 * - Consolidates three order-status counts (active / pending / accepted) into a
 *   single hero metric, then breaks them down in a sub-row below.
 * - Surfaces total spend per time period (today / this month / this year) so the
 *   buyer can monitor purchasing activity without navigating to a separate screen.
 *
 * Design:
 * - Burnt-orange linear gradient (`#CE4002 → #8C2800`) with decorative translucent
 *   circles for depth — consistent with the Mauzo brand palette.
 * - All numeric data is passed in as props; the card is purely presentational and
 *   carries no data-fetching logic of its own.
 * - The amount period toggle (Today / Month / Year) is local UI state — it only
 *   controls which pre-computed amount prop is displayed, not a new data fetch.
 *
 * Interactions with the rest of the app:
 * - Rendered by `DashboardSection` inside `src/app/(tabs)/index.tsx`.
 * - Amount props are derived client-side in `HomeScreen` from the `useOrders()`
 *   React Query cache, so no extra API call is made for the spend figures.
 * - Wrapped in `memo` to prevent re-renders caused by unrelated parent state.
 */

import { memo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { PackageIcon, ClockIcon, CheckCircleIcon } from '@/constants/icons'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The three selectable time windows for the "Total Spent" row.
 * Choosing a period filters the pre-computed amount prop displayed in the card.
 */
type AmountPeriod = 'day' | 'month' | 'year'

/**
 * Props for the DashboardCard component.
 *
 * Order counts come from the lightweight `useOrderSummary()` endpoint.
 * Amount totals are derived in the parent from the full `useOrders()` cache.
 *
 * @property activeOrders   - Orders in `awaiting_quote` or `dispatched` states.
 * @property pendingOrders  - Orders in `quote_received` state awaiting buyer decision.
 * @property acceptedOrders - Orders the buyer has accepted and are in fulfillment.
 * @property todayAmount    - Sum of `total_quoted_amount` for orders placed today (TZS).
 * @property monthAmount    - Sum for the current calendar month (TZS).
 * @property yearAmount     - Sum for the current calendar year (TZS).
 * @property ordersLoading  - `true` while the orders list is being fetched; shows "—" for amounts.
 * @property loading        - `true` while the summary endpoint is pending; shows "—" for counts.
 */
interface DashboardCardProps {
  activeOrders: number
  pendingOrders: number
  acceptedOrders: number
  todayAmount?: number
  monthAmount?: number
  yearAmount?: number
  ordersLoading?: boolean
  loading?: boolean
}

/**
 * Props for the internal `Metric` sub-component (one column in the sub-metrics row).
 */
interface MetricProps {
  icon: any
  label: string
  value: number
  valueColor: string
  rf: (s: number) => number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formats a raw TZS (Tanzanian Shilling) amount into a compact, human-readable
 * string suitable for the card's limited horizontal space.
 *
 * Scale rules:
 * - ≥ 1,000,000  → "TZS 1.2M"  (one decimal place)
 * - ≥ 1,000      → "TZS 450K"  (rounded to nearest thousand)
 * - < 1,000      → "TZS 750"   (exact, no suffix)
 *
 * @param amount - Raw monetary amount in TZS (integer or float).
 * @returns Human-readable string, e.g. "TZS 1.5M", "TZS 250K", "TZS 500".
 */
function formatTZS(amount: number): string {
  if (amount >= 1_000_000) return `TZS ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `TZS ${Math.round(amount / 1_000)}K`
  return `TZS ${amount.toLocaleString()}`
}

// ─── Metric sub-component ─────────────────────────────────────────────────────

/**
 * A single column in the card's sub-metrics row.
 *
 * Renders an icon badge, a numeric value, and a label stacked vertically.
 * The icon background uses a semi-transparent version of `valueColor` to keep
 * the palette cohesive against the gradient card.
 *
 * This is intentionally a plain function component (not exported) because it is
 * only used inside `DashboardCard` and has no meaningful standalone purpose.
 */
const Metric = memo(function Metric({ icon, label, value, valueColor, rf }: MetricProps) {
  return (
    <View style={styles.metric}>
      {/* Icon badge: 22-hex alpha appended to valueColor produces ~13% opacity tint */}
      <View style={[styles.metricIcon, { backgroundColor: `${valueColor}22` }]}>
        <HugeiconsIcon icon={icon} size={12} color={valueColor} strokeWidth={1.5} />
      </View>
      <Text style={[styles.metricValue, { fontSize: rf(20), color: valueColor }]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { fontSize: rf(10) }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
})

// ─── DashboardCard ────────────────────────────────────────────────────────────

/**
 * Hero gradient card for the Home screen's "Order Overview" section.
 *
 * Layout (top → bottom):
 *   1. Header row   — section label (uppercase) + package icon badge
 *   2. Hero row     — large total-active count + "Active Workload" subtitle
 *   3. Rule         — visual separator
 *   4. Sub-metrics  — three columns: Active / Pending / Accepted
 *   5. Rule         — visual separator
 *   6. Amount row   — "TOTAL SPENT" label + formatted amount + period chips
 *
 * The period chips (Today / Month / Year) are pure local state; switching them
 * only changes which pre-computed prop value is rendered — no network call.
 *
 * @see DashboardCardProps for full prop documentation.
 */
const DashboardCard = memo(function DashboardCard({
  activeOrders,
  pendingOrders,
  acceptedOrders,
  todayAmount   = 0,
  monthAmount   = 0,
  yearAmount    = 0,
  ordersLoading = false,
  loading       = false,
}: DashboardCardProps) {
  const { rf, isTablet } = useResponsive()
  const { t } = useTranslation()

  // Local state for the spend period toggle — defaults to "month" as the most
  // useful single-glance view for a B2B buyer reviewing their purchasing cadence.
  const [amountPeriod, setAmountPeriod] = useState<AmountPeriod>('month')

  // Aggregate all three count categories into a single "workload" hero figure.
  const totalActive = activeOrders + pendingOrders + acceptedOrders

  // Resolve which pre-computed amount to display based on the selected period.
  const displayAmount = amountPeriod === 'day'   ? todayAmount
                      : amountPeriod === 'month' ? monthAmount
                      : yearAmount

  /** Period chip definitions — labels are i18n-resolved at render time. */
  const PERIOD_CHIPS: { key: AmountPeriod; label: string }[] = [
    { key: 'day',   label: t('home.amount_period_day')   },
    { key: 'month', label: t('home.amount_period_month') },
    { key: 'year',  label: t('home.amount_period_year')  },
  ]

  return (
    <LinearGradient
      colors={['#CE4002', '#B33600', '#8C2800']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isTablet && styles.cardTablet]}
    >
      {/* ── Decorative backdrop circles ──
          Pure visual depth — absolutely positioned so they don't affect layout.
          Opacity kept very low (5–7%) to avoid competing with the text. */}
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />
      <View style={styles.circleTiny} />

      <View style={styles.content}>

        {/* ── 1. Header row ── */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { fontSize: rf(11) }]}>
            {t('home.order_overview').toUpperCase()}
          </Text>
          <View style={styles.iconBadge}>
            <HugeiconsIcon
              icon={PackageIcon}
              size={14}
              color='rgba(255,255,255,0.85)'
              strokeWidth={1.5}
            />
          </View>
        </View>

        {/* ── 2. Hero row ──
            The large number (totalActive) is the primary KPI; the label and
            subtitle to its right provide context without stealing visual weight. */}
        <View style={styles.heroRow}>
          <Text style={[styles.heroNum, { fontSize: rf(48) }]}>
            {loading ? '—' : totalActive}
          </Text>
          <View style={styles.heroMeta}>
            <Text style={[styles.heroLabel, { fontSize: rf(13) }]}>
              {t('analytics.active_workload')}
            </Text>
            <Text style={[styles.heroSub, { fontSize: rf(11) }]}>
              {t('analytics.orders_in_progress')}
            </Text>
          </View>
        </View>

        {/* ── 3. Rule ── */}
        <View style={styles.rule} />

        {/* ── 4. Sub-metrics row ──
            Three equally-weighted columns separated by thin vertical rules.
            Colours are chosen to communicate urgency: white (neutral), yellow
            (attention needed), green (positive/resolved). */}
        <View style={styles.metricsRow}>
          <Metric
            icon={PackageIcon}
            label={t('home.active_orders')}
            value={activeOrders}
            valueColor='rgba(255,255,255,1)'
            rf={rf}
          />
          <View style={styles.metricSep} />
          <Metric
            icon={ClockIcon}
            label={t('home.pending_quotes')}
            value={pendingOrders}
            valueColor='rgba(255,230,80,1)'
            rf={rf}
          />
          <View style={styles.metricSep} />
          <Metric
            icon={CheckCircleIcon}
            label={t('home.accepted')}
            value={acceptedOrders}
            valueColor='rgba(130,255,170,1)'
            rf={rf}
          />
        </View>

        {/* ── 5. Rule ── */}
        <View style={styles.rule} />

        {/* ── 6. Total spent row ──
            Left side: caption label + formatted amount.
            Right side: period chips to switch the displayed amount.
            `ordersLoading` guard prevents showing stale "0" before data arrives. */}
        <View style={styles.amountRow}>
          <View style={styles.amountLeft}>
            <Text style={[styles.amountCaption, { fontSize: rf(10) }]}>
              {t('home.total_spent').toUpperCase()}
            </Text>
            <Text style={[styles.amountValue, { fontSize: rf(15) }]}>
              {ordersLoading ? '—' : formatTZS(displayAmount)}
            </Text>
          </View>

          {/* Period toggle chips */}
          <View style={styles.chipRow}>
            {PERIOD_CHIPS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.chip, amountPeriod === key && styles.chipActive]}
                onPress={() => setAmountPeriod(key)}
                activeOpacity={0.7}
                hitSlop={4}
              >
                <Text style={[
                  styles.chipText,
                  { fontSize: rf(10) },
                  amountPeriod === key && styles.chipTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </LinearGradient>
  )
})

export default DashboardCard

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Fixed height ensures the card never reflows when data loads in. */
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 258,
  },
  cardTablet: {
    height: 284,
    borderRadius: 24,
  },

  // ── Decorative circles ────────────────────────────────────────────────────
  circleLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  circleSmall: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -25,
    left: 20,
  },
  circleTiny: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: 30,
    right: 80,
  },

  // ── Layout ────────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  heroNum: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    lineHeight: 54,
  },
  heroMeta: {
    paddingBottom: 4,
    gap: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins-SemiBold',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Poppins-Regular',
  },

  // ── Separators ────────────────────────────────────────────────────────────
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // ── Sub-metrics row ───────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: 'Poppins-Bold',
    lineHeight: 24,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.60)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 13,
  },
  metricSep: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 2,
  },

  // ── Total Spent row ───────────────────────────────────────────────────────
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLeft: {
    gap: 1,
  },
  amountCaption: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.6,
  },
  amountValue: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  // ── Period chips ──────────────────────────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    /** Subtle ghost background so inactive chips are visible against the gradient. */
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    /** More opaque background highlights the selected period. */
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  chipText: {
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.60)',
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
})
