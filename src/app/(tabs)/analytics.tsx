/**
 * @file analytics.tsx  (tabs)
 * @description Analytics screen — the sixth tab in the Mauzo ordering app.
 *
 * Purpose:
 * Provides buyers with a visual overview of their ordering activity, covering
 * order volume trends, total spend over time, status distribution, and a
 * quick-access list of recent orders.
 *
 * Data strategy — no extra API calls:
 * All chart data is derived client-side from the `useOrders()` React Query cache.
 * The `['orders']` query key is shared with the Orders tab, so if the buyer has
 * already visited that tab the data is served instantly from cache. `useFocusEffect`
 * triggers a background refetch each time this tab gains focus to keep figures fresh.
 *
 * Chart design — dual mini-charts per time period:
 * Order counts and total amounts operate on vastly different numerical scales
 * (e.g. 5 orders vs 450,000 TZS). Rendering them on the same Y-axis would make
 * the count bars invisible. The solution is two stacked mini BarCharts, each with
 * its own independent Y-axis, inside the same card — the same pattern used by
 * Shopify Analytics and Stripe Dashboard.
 *
 * Amounts in the amount chart are displayed in K TZS (÷ 1,000) to keep the
 * Y-axis labels readable (e.g. "450" instead of "450000").
 *
 * Sections rendered (top → bottom):
 *   1. Header — title + subtitle + loading spinner
 *   2. Summary cards — total / pending / completed counts
 *   3. Chart card — period toggle + dual BarCharts (orders count + amount K TZS)
 *   4. Status breakdown — pill grid sorted by volume
 *   5. Recent orders — last 8 orders with stagger animation
 *   6. Empty state — shown when no orders exist at all
 */

import { memo, useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { BarChart } from 'react-native-gifted-charts'
import { router, useFocusEffect } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useOrders } from '@/hooks/useOrders'
import { useResponsive } from '@/hooks/useResponsive'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import { spring, listStagger } from '@/constants/animations'
import { OrdersIcon, PackageIcon, CheckCircleIcon, ClockIcon, RefreshIcon } from '@/constants/icons'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import { SkeletonBox } from '@/components/skeletons/Shimmer'
import type { Order, OrderStatus } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The three time granularities the buyer can select for the Order Volume chart.
 * - `weekly`  — Last 7 days, one bar per calendar day.
 * - `monthly` — Last 28 days, one bar per 7-day week block (Wk 1 – Wk 4).
 * - `yearly`  — Last 12 calendar months, one bar per month.
 */
type Period = 'weekly' | 'monthly' | 'yearly'

/**
 * A single bar entry consumed by `react-native-gifted-charts` `<BarChart>`.
 *
 * @property value      - Numeric height of the bar (count or K TZS amount).
 * @property label      - X-axis label displayed below the bar (e.g. "Mon", "Wk 2", "Jun").
 * @property frontColor - Fill colour of the bar; active periods use a brighter shade.
 */
interface BarEntry {
  value: number
  label: string
  frontColor: string
}

/**
 * The structured output of each `build*Data()` function, containing two
 * parallel bar arrays that share the same time-slot labels.
 *
 * @property countBars  - Bar heights represent total order count per slot.
 * @property amountBars - Bar heights represent total quoted amount ÷ 1,000 (K TZS) per slot.
 * @property labels     - Ordered list of entity labels (shared by both charts).
 */
interface ChartData {
  countBars:  BarEntry[]
  amountBars: BarEntry[]
  labels:     string[]
}

// ─── Chart colour tokens ──────────────────────────────────────────────────────

interface ChartColors {
  primary:    string
  primaryDim: string
  amountHi:   string
  amountDim:  string
  chartBg:    string
}

function getChartColors(theme: AppTheme): ChartColors {
  return {
    primary:    theme.colors.primary,
    primaryDim: theme.colors.primaryMuted,
    amountHi:   theme.colors.warning,
    amountDim:  theme.isDark ? '#78460A' : '#FCD34D',
    chartBg:    theme.colors.background,
  }
}

// ─── Client-side data builders ────────────────────────────────────────────────
//
// These functions group the raw orders array into time-slot buckets and build
// the two parallel bar arrays for the dual chart. They operate entirely in
// memory on the cached orders data — no network call is made.
//
// Amount normalisation: divide by 1,000 so K TZS values fit the Y-axis without
// requiring a six-digit axis label (e.g. "450" instead of "450000").

/**
 * Builds chart data for the **Weekly** view (last 7 calendar days).
 *
 * Algorithm:
 * 1. Create 7 time slots, one per calendar day, ending with today (slot index 6).
 *    Each slot stores its midnight timestamp as a lookup key.
 * 2. Iterate through all orders, stripping the time component from `created_at`
 *    to produce a comparable midnight timestamp, then accumulate into the
 *    matching slot.
 * 3. Map each slot to a pair of BarEntry objects — count bar (orange) and
 *    amount bar (amber). Today's slot uses the brighter "active" colour.
 *
 * @param orders - Full list of orders from the `useOrders()` cache.
 * @returns `ChartData` with 7 entries per array, oldest day on the left.
 */
function buildWeeklyData(orders: Order[], colors: ChartColors): ChartData {
  const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now   = new Date()

  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return { key: d.getTime(), label: DAYS[d.getDay()], count: 0, amount: 0, isToday: i === 6 }
  })

  orders.forEach(o => {
    const t = new Date(o.created_at)
    t.setHours(0, 0, 0, 0)
    const s = slots.find(s => s.key === t.getTime())
    if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
  })

  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map(s => ({
      value:      s.count,
      label:      s.label,
      frontColor: s.isToday ? colors.primary    : colors.primaryDim,
    })),
    amountBars: slots.map(s => ({
      value:      Math.round(s.amount / 1_000),
      label:      s.label,
      frontColor: s.isToday ? colors.amountHi : colors.amountDim,
    })),
  }
}

/**
 * Builds chart data for the **Monthly** view (last 28 days split into 4 weeks).
 *
 * Week boundaries (days ago):
 *   Wk 1 — 28 to 21 days ago  (oldest)
 *   Wk 2 — 21 to 14 days ago
 *   Wk 3 — 14 to  7 days ago
 *   Wk 4 —  7 to  0 days ago  (current week — highlighted)
 *
 * Orders are assigned to a slot by computing `diff` (days elapsed since order
 * creation) and checking which `[end, start)` half-open interval it falls into.
 *
 * @param orders - Full list of orders from the `useOrders()` cache.
 * @returns `ChartData` with 4 entries per array, oldest week on the left.
 */
function buildMonthlyData(orders: Order[], colors: ChartColors): ChartData {
  const now = new Date()

  const slots = [
    { label: 'Wk 1', count: 0, amount: 0, start: 28, end: 21 },
    { label: 'Wk 2', count: 0, amount: 0, start: 21, end: 14 },
    { label: 'Wk 3', count: 0, amount: 0, start: 14, end: 7  },
    { label: 'Wk 4', count: 0, amount: 0, start: 7,  end: 0  },
  ]

  orders.forEach(o => {
    const diff = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / 86_400_000)
    const s = slots.find(sl => diff < sl.start && diff >= sl.end)
    if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
  })

  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map((s, i) => ({
      value:      s.count,
      label:      s.label,
      frontColor: i === 3 ? colors.primary    : colors.primaryDim,
    })),
    amountBars: slots.map((s, i) => ({
      value:      Math.round(s.amount / 1_000),
      label:      s.label,
      frontColor: i === 3 ? colors.amountHi : colors.amountDim,
    })),
  }
}

/**
 * Builds chart data for the **Yearly** view (last 12 calendar months).
 *
 * Algorithm:
 * 1. Generate 12 month slots working backwards from the current month.
 *    Each slot stores `{ yr, mo }` for precise matching across year boundaries
 *    (e.g. December of the previous year when the current month is January).
 * 2. Match each order to a slot by comparing its year and month.
 * 3. The last slot (index 11) is the current month — highlighted with the
 *    active colour.
 *
 * @param orders - Full list of orders from the `useOrders()` cache.
 * @returns `ChartData` with 12 entries per array, oldest month on the left.
 */
function buildYearlyData(orders: Order[], colors: ChartColors): ChartData {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now    = new Date()

  const slots = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return { yr: d.getFullYear(), mo: d.getMonth(), label: MONTHS[d.getMonth()], count: 0, amount: 0 }
  })

  orders.forEach(o => {
    const d = new Date(o.created_at)
    const s = slots.find(sl => sl.yr === d.getFullYear() && sl.mo === d.getMonth())
    if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
  })

  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map((s, i) => ({
      value:      s.count,
      label:      s.label,
      frontColor: i === 11 ? colors.primary    : colors.primaryDim,
    })),
    amountBars: slots.map((s, i) => ({
      value:      Math.round(s.amount / 1_000),
      label:      s.label,
      frontColor: i === 11 ? colors.amountHi : colors.amountDim,
    })),
  }
}

// ─── Status colour config ─────────────────────────────────────────────────────

/**
 * Colour and label mapping for each `OrderStatus` value, used by the Status
 * Breakdown pill grid. Colours intentionally mirror those used in `StatusBadge`
 * to maintain visual consistency across the app.
 *
 * Each entry provides:
 * - `label`  — Human-readable display name for the status.
 * - `color`  — Text and icon colour (also applied to the pill border in some views).
 * - `bg`     — Background tint for the pill, derived from the colour's light variant.
 */
const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  awaiting_quote: { label: 'Awaiting Quote', color: '#6B7280', bg: '#F0F0F0' },
  quote_received: { label: 'Quote Received', color: '#D97706', bg: '#FEF3C7' },
  accepted:       { label: 'Accepted',       color: '#059669', bg: '#D1FAE5' },
  rejected:       { label: 'Rejected',       color: '#DC2626', bg: '#FEE2E2' },
  dispatched:     { label: 'Dispatched',     color: '#7C3AED', bg: '#EDE9FE' },
  delivered:      { label: 'Delivered',      color: '#2563EB', bg: '#DBEAFE' },
  closed:         { label: 'Closed',         color: '#6B7280', bg: '#F0F0F0' },
  cancelled:      { label: 'Cancelled',      color: '#DC2626', bg: '#FEE2E2' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Three-segment toggle (Weekly / Monthly / Yearly) for selecting the chart period.
 *
 * Implemented as a custom control rather than `@react-native-segmented-control/segmented-control`
 * to avoid a native dependency that requires rebuild on every Expo SDK upgrade.
 *
 * The active segment is elevated with a white background + shadow to read as a
 * "lifted" selection pill — a common iOS-style segmented control pattern.
 *
 * @param value    - Currently selected period.
 * @param onChange - Callback invoked with the newly selected period.
 * @param rf       - Responsive font-scale function from `useResponsive`.
 */
const PeriodToggle = memo(function PeriodToggle({
  value,
  onChange,
  rf,
}: {
  value: Period
  onChange: (p: Period) => void
  rf: (s: number) => number
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const opts: { key: Period; label: string }[] = [
    { key: 'weekly',  label: t('analytics.period_weekly')  },
    { key: 'monthly', label: t('analytics.period_monthly') },
    { key: 'yearly',  label: t('analytics.period_yearly')  },
  ]
  return (
    <View style={{ flexDirection: 'row', backgroundColor: theme.colors.divider, borderRadius: 12, padding: 3 }}>
      {opts.map(o => (
        <TouchableOpacity
          key={o.key}
          style={[
            { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
            value === o.key && { backgroundColor: theme.colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
          ]}
          onPress={() => onChange(o.key)}
          activeOpacity={0.8}
        >
          <Text style={[
            { fontFamily: 'Poppins-Medium', color: theme.colors.textMuted },
            { fontSize: rf(13) },
            value === o.key && { color: theme.colors.text, fontFamily: 'Poppins-SemiBold' },
          ]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
})

/**
 * A single KPI summary card rendered in the three-card row at the top of the screen.
 *
 * Displays an icon, a large numeric value, and a descriptive label. The coloured
 * top border visually links each card to its semantic meaning (orange = total,
 * amber = pending, green = completed).
 *
 * @param icon   - HugeIcons icon definition.
 * @param label  - Descriptive label rendered below the value.
 * @param value  - Numeric KPI value.
 * @param color  - Accent colour for the top border, icon, and value text.
 * @param bg     - Light background tint for the icon badge container.
 * @param rf     - Responsive font-scale function.
 * @param delay  - Entrance animation delay in ms (supports stagger between the three cards).
 */
const SummaryCard = memo(function SummaryCard({
  icon, label, value, color, bg, rf, delay,
}: {
  icon: any; label: string; value: number
  color: string; bg: string; rf: (s: number) => number; delay: number
}) {
  const { theme } = useTheme()
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
      style={{
        flex: 1, backgroundColor: theme.colors.card, borderRadius: 14, padding: 14,
        borderTopWidth: 3, borderTopColor: color,
        borderWidth: 1, borderColor: theme.colors.divider,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 5, elevation: 2,
        alignItems: 'center', gap: 6,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <HugeiconsIcon icon={icon} size={16} color={color} strokeWidth={1.5} />
      </View>
      <Text style={{ fontFamily: 'Poppins-Bold', color, fontSize: rf(24) }}>{value}</Text>
      <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textSub, textAlign: 'center', fontSize: rf(11) }}>{label}</Text>
    </Animated.View>
  )
})

/**
 * A single row in the "Recent Orders" list at the bottom of the Analytics screen.
 *
 * Each row animates in with a `FadeInDown` stagger keyed to its `index`, creating
 * a cascading entrance effect as the list populates.
 *
 * Tapping the row navigates to the full Order Detail screen via Expo Router.
 *
 * @param order - The order to render; sourced from the first 8 items in `useOrders()`.
 * @param index - Zero-based position used to compute the stagger delay.
 * @param rf    - Responsive font-scale function.
 */
const RecentOrderItem = memo(function RecentOrderItem({
  order,
  index,
  rf,
}: {
  order: Order
  index: number
  rf: (s: number) => number
}) {
  const { theme } = useTheme()
  return (
    <Animated.View
      entering={FadeInDown
        .delay(listStagger(index, 50))
        .springify()
        .damping(spring.list.damping)
        .stiffness(spring.list.stiffness)}
    >
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, gap: 12 }}
        onPress={() => router.push(`/order/${order.order_id}`)}
        activeOpacity={0.85}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: 'Poppins-Bold', color: theme.colors.text, fontSize: rf(13) }}>{formatOrderId(order.order_id)}</Text>
          <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textSub, fontSize: rf(12) }} numberOfLines={1}>
            {order.supplier.business_name}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textMuted, fontSize: rf(11) }}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <StatusBadge status={order.status} size='sm' />
          {order.total_quoted_amount != null && (
            <Text style={{ fontFamily: 'Poppins-SemiBold', color: theme.colors.primary, fontSize: rf(12) }}>
              TZS {order.total_quoted_amount.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
})

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Analytics screen — rendered as the fifth tab (`/(tabs)/analytics`).
 *
 * State:
 * - `period` — Controls which time granularity the chart displays. Local UI state;
 *   switching period re-runs the `buildXxxData()` function synchronously via `useMemo`.
 *
 * Data:
 * - `useOrders()` — All orders for the authenticated user, cached by React Query.
 *   `useFocusEffect` triggers a background refetch each time the tab is opened so
 *   that analytics reflect the most recent activity without requiring a pull-to-refresh.
 *
 * Computed values:
 * - `chartData`     — Two bar arrays (count + amount) derived from orders for the selected period.
 * - `statusCounts`  — Map of OrderStatus → count, derived in a single pass over `orders`.
 * - `recentOrders`  — First 8 orders (already sorted newest-first by the API).
 * - `completedCount`— Sum of dispatched + delivered + closed orders.
 * - `pendingCount`  — Sum of awaiting_quote + quote_received orders.
 *
 * Chart sizing:
 * Bar width and spacing are computed from the available screen width so bars
 * fill the chart area without overflow or excessive whitespace regardless of
 * device size. The formula is:
 *   spacing = (chartWidth − barWidth × barCount) / (barCount + 1)
 * clamped to a minimum to prevent bars from touching.
 */
export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('weekly')
  const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders()
  const { hp, rf, gap, isTablet, contentMaxWidth } = useResponsive()
  const { width: screenWidth } = useWindowDimensions()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  const chartColors = getChartColors(theme)

  // Trigger a background refetch each time this tab becomes visible.
  // `useCallback` with an empty dep array is required by useFocusEffect's contract.
  useFocusEffect(useCallback(() => { refetch() }, []))

  // ── Derived chart data ──────────────────────────────────────────────────────
  // Re-computed only when the orders list or the selected period changes.
  const chartData = useMemo<ChartData>(() => {
    if (!orders?.length) return { countBars: [], amountBars: [], labels: [] }
    switch (period) {
      case 'weekly':  return buildWeeklyData(orders, chartColors)
      case 'monthly': return buildMonthlyData(orders, chartColors)
      case 'yearly':  return buildYearlyData(orders, chartColors)
    }
  }, [orders, period, chartColors.primary])

  // ── Derived counts for the summary row ─────────────────────────────────────
  // Single-pass accumulation over the orders array for the status breakdown grid.
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatus, number>> = {}
    orders?.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
    return counts
  }, [orders])

  const totalOrders = orders?.length ?? 0

  // "Completed" groups statuses that represent successful order fulfilment.
  const completedCount = (orders ?? []).filter(o =>
    ['dispatched', 'delivered', 'closed'].includes(o.status)
  ).length

  // "Pending" groups statuses where the buyer is waiting on the supplier.
  const pendingCount = (orders ?? []).filter(o =>
    ['awaiting_quote', 'quote_received'].includes(o.status)
  ).length

  // Cap at 8 to keep the recent orders list concise; older orders are on the Orders tab.
  const recentOrders = useMemo(() => (orders ?? []).slice(0, 8), [orders])

  // ── Chart sizing ────────────────────────────────────────────────────────────
  // Available width = screen width − horizontal padding (×2) − chart card padding (16 each side).
  // Tablet layout subtracts an additional 16 dp for the content max-width constraint.
  const chartWidth = Math.max(200, screenWidth - hp * 2 - 32 - (isTablet ? 16 : 0))

  // Narrower bars for yearly view (12 bars) to avoid cramping on small screens.
  const barWidth = period === 'yearly' ? 10 : 16

  // Distribute remaining horizontal space evenly across inter-bar gaps.
  // `Math.max(min, …)` guards against negative spacing when the screen is very narrow.
  const spacing = period === 'yearly'  ? Math.max(6,  (chartWidth - barWidth * 12) / 13)
                : period === 'monthly' ? Math.max(32, (chartWidth - barWidth * 4)  / 5)
                :                        Math.max(20, (chartWidth - barWidth * 7)  / 8)

  // Show chart content only when at least one bar in either series has a value > 0.
  const hasData = chartData.countBars.some(d => d.value > 0) || chartData.amountBars.some(d => d.value > 0)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp, paddingBottom: 40 }]}
      >
        {/* Constrain content width on tablets to avoid overly wide cards. */}
        <View style={contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : undefined}>

          {/* ── 1. Header ── */}
          <Animated.View
            entering={FadeInDown.delay(0).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
            style={styles.header}
          >
            <View>
              <Text style={[styles.title, { fontSize: rf(22) }]}>{t('analytics.title')}</Text>
              <Text style={[styles.subtitle, { fontSize: rf(13) }]}>{t('analytics.subtitle')}</Text>
            </View>
            {/* Inline spinner during the initial load; replaced by the RefreshControl on pull-to-refresh. */}
            {isLoading && <ActivityIndicator size='small' color={theme.colors.primary} />}
          </Animated.View>

          {/* ── Error state ── */}
          {isError ? (
            <View style={styles.errorWrap}>
              <Text style={[styles.errorText, { fontSize: rf(14) }]}>{t('analytics.error_load')}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
                <HugeiconsIcon icon={RefreshIcon} size={16} color={theme.colors.primary} strokeWidth={2} />
                <Text style={[styles.retryText, { fontSize: rf(14) }]}>{t('common.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ── 2. Summary cards (total / pending / completed) ── */}
              <View style={[styles.summaryRow, { gap, marginTop: 20 }]}>
                <SummaryCard icon={PackageIcon}     label={t('analytics.total_orders')}     value={totalOrders}    color={theme.colors.primary} bg={theme.colors.primaryLight} rf={rf} delay={50}  />
                <SummaryCard icon={ClockIcon}       label={t('analytics.pending_orders')}   value={pendingCount}   color={theme.colors.warning}  bg={theme.colors.warningBg}   rf={rf} delay={110} />
                <SummaryCard icon={CheckCircleIcon} label={t('analytics.completed_orders')} value={completedCount} color={theme.colors.success}  bg={theme.colors.successBg}   rf={rf} delay={170} />
              </View>

              {/* ── 3. Chart card ── */}
              <Animated.View
                entering={FadeInDown.delay(220).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
                style={[styles.chartCard, { marginTop: gap + 8 }]}
              >
                {/* Chart header: section title + period toggle */}
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <HugeiconsIcon icon={OrdersIcon} size={16} color={theme.colors.primary} strokeWidth={1.5} />
                    <Text style={[styles.chartTitle, { fontSize: rf(15) }]}>{t('analytics.chart_title')}</Text>
                  </View>
                  <PeriodToggle value={period} onChange={setPeriod} rf={rf} />
                </View>

                {/* Chart body: skeleton → empty state → dual charts */}
                <View style={styles.chartBody}>
                  {isLoading ? (
                    // Two skeleton placeholders mirror the two mini-charts that will appear.
                    <View style={styles.chartLoading}>
                      <SkeletonBox height={120} borderRadius={12} />
                      <View style={{ height: 12 }} />
                      <SkeletonBox height={120} borderRadius={12} />
                    </View>
                  ) : !hasData ? (
                    <View style={styles.chartEmpty}>
                      <HugeiconsIcon icon={OrdersIcon} size={32} color={theme.colors.textDisabled} strokeWidth={1} />
                      <Text style={[styles.chartEmptyText, { fontSize: rf(13) }]}>
                        {t('analytics.chart_empty')}
                      </Text>
                    </View>
                  ) : (
                    // Dual mini-charts: each has its own independent Y-axis, avoiding the
                    // scale-mismatch problem that would arise from plotting counts (0–20)
                    // and amounts (0–500,000 TZS) on the same axis.
                    <View style={styles.dualChartWrap}>

                      {/* Mini-chart 1: Total Orders (count) */}
                      <View style={styles.miniChartLegend}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                        <Text style={[styles.legendLabel, { fontSize: rf(12) }]}>
                          {t('analytics.legend_orders')}
                        </Text>
                      </View>
                      <BarChart
                        data={chartData.countBars}
                        width={chartWidth}
                        height={110}
                        barWidth={barWidth}
                        spacing={spacing}
                        roundedTop
                        roundedBottom
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisLabelWidth={28}
                        yAxisTextStyle={styles.axisText}
                        xAxisLabelTextStyle={styles.axisText}
                        noOfSections={4}
                        isAnimated
                        animationDuration={800}
                        backgroundColor={chartColors.chartBg}
                      />

                      <View style={styles.miniChartDivider} />

                      {/* Mini-chart 2: Total Amount (K TZS) */}
                      <View style={styles.miniChartLegend}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                        <Text style={[styles.legendLabel, { fontSize: rf(12) }]}>
                          {t('analytics.legend_amount')}
                        </Text>
                      </View>
                      <BarChart
                        data={chartData.amountBars}
                        width={chartWidth}
                        height={110}
                        barWidth={barWidth}
                        spacing={spacing}
                        roundedTop
                        roundedBottom
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisLabelWidth={28}
                        yAxisTextStyle={styles.axisText}
                        xAxisLabelTextStyle={styles.axisText}
                        noOfSections={4}
                        isAnimated
                        animationDuration={800}
                        backgroundColor={chartColors.chartBg}
                      />
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* ── 4. Status breakdown ── */}
              {/* Only shown once data has loaded and at least one status is present. */}
              {!isLoading && Object.keys(statusCounts).length > 0 && (
                <Animated.View
                  entering={FadeInDown.delay(300).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
                  style={[styles.sectionCard, { marginTop: gap + 8 }]}
                >
                  <Text style={[styles.sectionTitle, { fontSize: rf(15) }]}>
                    {t('analytics.status_breakdown')}
                  </Text>
                  {/* Sort pills by count descending so the most active statuses appear first. */}
                  <View style={styles.statusGrid}>
                    {(Object.entries(statusCounts) as [OrderStatus, number][])
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => {
                        const cfg = STATUS_CFG[status]
                        return (
                          <View key={status} style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.statusCount, { color: cfg.color, fontSize: rf(15) }]}>{count}</Text>
                            <Text style={[styles.statusLabel, { color: cfg.color, fontSize: rf(10) }]}>{cfg.label}</Text>
                          </View>
                        )
                      })}
                  </View>
                </Animated.View>
              )}

              {/* ── 5. Recent orders list ── */}
              {recentOrders.length > 0 && (
                <View style={[styles.sectionCard, { marginTop: gap + 8 }]}>
                  <Animated.View
                    entering={FadeInDown.delay(360).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
                  >
                    <Text style={[styles.sectionTitle, { fontSize: rf(15) }]}>
                      {t('analytics.recent_orders')}
                    </Text>
                  </Animated.View>
                  {isLoading
                    ? Array.from({ length: 4 }, (_, i) => (
                        <View key={i} style={{ paddingVertical: 12, gap: 6 }}>
                          <SkeletonBox height={13} width='55%' borderRadius={5} />
                          <SkeletonBox height={11} width='40%' borderRadius={4} />
                        </View>
                      ))
                    : recentOrders.map((o, i) => (
                        <RecentOrderItem key={o.order_id} order={o} index={i} rf={rf} />
                      ))
                  }
                  {/* "View All" button appears only when there are more than 8 orders. */}
                  {orders && orders.length > 8 && (
                    <TouchableOpacity
                      style={styles.viewAllBtn}
                      onPress={() => router.push('/(tabs)/orders')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.viewAllText, { fontSize: rf(13) }]}>View All Orders</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* ── 6. Empty state (no orders at all) ── */}
              {!isLoading && !orders?.length && (
                <Animated.View
                  entering={FadeInDown.delay(100).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
                  style={styles.emptyWrap}
                >
                  <HugeiconsIcon icon={OrdersIcon} size={48} color={theme.colors.textDisabled} strokeWidth={1} />
                  <Text style={[styles.emptyTitle, { fontSize: rf(16) }]}>{t('analytics.no_orders')}</Text>
                  <Text style={[styles.emptySub,   { fontSize: rf(13) }]}>{t('analytics.no_orders_sub')}</Text>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingTop: 16 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    title:    { fontFamily: 'Poppins-Bold',    color: theme.colors.text },
    subtitle: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub, marginTop: 2 },

    summaryRow: { flexDirection: 'row' },

    chartCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    chartHeader:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 },
    chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chartTitle:    { fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    chartBody: {
      paddingHorizontal: 8,
      paddingBottom: 16,
      minHeight: 180,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },

    dualChartWrap:    { gap: 0 },
    miniChartLegend:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 2 },
    legendDot:        { width: 8, height: 8, borderRadius: 4 },
    legendLabel:      { fontFamily: 'Poppins-Medium', color: theme.colors.text },
    miniChartDivider: { height: 1, backgroundColor: theme.colors.divider, marginHorizontal: 8, marginTop: 4 },
    chartLoading:     { padding: 16, gap: 12 },
    chartEmpty:       { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 40 },
    chartEmptyText:   { fontFamily: 'Poppins-Regular', color: theme.colors.textMuted },
    axisText:         { color: theme.colors.textMuted, fontFamily: 'Poppins-Regular', fontSize: 10 },

    sectionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionTitle: { fontFamily: 'Poppins-SemiBold', color: theme.colors.text, marginBottom: 12 },
    statusGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusPill:   { alignItems: 'center', padding: 10, borderRadius: 12, minWidth: 80, gap: 2 },
    statusCount:  { fontFamily: 'Poppins-Bold' },
    statusLabel:  { fontFamily: 'Poppins-Regular', textAlign: 'center' },

    viewAllBtn:  { marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.primary, alignItems: 'center' },
    viewAllText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },

    emptyWrap:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    emptyTitle: { fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    emptySub:   { fontFamily: 'Poppins-Regular',  color: theme.colors.textMuted, textAlign: 'center', paddingHorizontal: 32 },

    errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    errorText: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    retryBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.primary },
    retryText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },
  })
}
