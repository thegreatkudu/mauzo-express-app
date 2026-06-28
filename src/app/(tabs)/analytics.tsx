/**
 * @file analytics.tsx  (tabs)
 * @description Analytics screen — the sixth tab in the Mauzo ordering app.
 *
 * Purpose:
 * Provides buyers with a visual overview of their ordering activity, covering
 * order volume trends, total spend over time, status distribution, and a
 * quick-access list of recent orders.
 *
 * Data strategy — demo-first, API-ready:
 * Chart data is derived client-side from the `useOrders()` React Query cache.
 * When the orders array is empty (first launch or fresh account), the screen
 * automatically enters **demo mode**, rendering production-quality synthetic
 * data so stakeholders see exactly how the dashboard will look once connected
 * to the live backend.  Switching to live data requires only removing the
 * `isDemo` branch — the data pipeline is otherwise identical.
 *
 * Demo data lives in `@/constants/analyticsDemo` and is never embedded in
 * UI components, keeping the architecture swap-ready.
 *
 * Chart design — dual mini-charts per time period:
 * Order counts and total amounts operate on vastly different numerical scales
 * (e.g. 5 orders vs 450,000 TZS). The solution is two stacked mini BarCharts,
 * each with its own independent Y-axis — the same pattern used by Shopify
 * Analytics and Stripe Dashboard.  Amounts are displayed in K TZS (÷ 1,000).
 *
 * Periods supported (scrollable chip row):
 *   today   → 9 hourly buckets  (08:00–16:00)
 *   week    → 7 daily bars      (last 7 calendar days)
 *   month   → 4 weekly bars     (last 30 days split into Wk 1–4)
 *   quarter → 3 monthly bars    (last 3 calendar months)
 *   half    → 6 monthly bars    (last 6 calendar months)
 *   year    → 12 monthly bars   (last 12 calendar months)
 *
 * Sections rendered (top → bottom):
 *   1. Header — title + subtitle + loading spinner
 *   2. Summary cards — total / pending / completed counts
 *   3. Demo banner — shown only when rendering demo data (no real orders yet)
 *   4. Chart card — period chip strip + metrics strip + dual BarCharts
 *   5. Status breakdown — pill grid sorted by volume
 *   6. Recent orders — last 8 orders with stagger animation
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
import {
  IS_DEMO_MODE,
  buildDemoChartData,
  getDemoPeriodMetrics,
  deriveRealPeriodMetrics,
  DEMO_STATUS_COUNTS,
  DEMO_TOTALS,
  DEMO_RECENT_ORDERS,
} from '@/constants/analyticsDemo'
import type { AnalyticsPeriod, PeriodMetrics } from '@/constants/analyticsDemo'
import { OrdersIcon, PackageIcon, CheckCircleIcon, ClockIcon, RefreshIcon } from '@/constants/icons'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import { SkeletonBox } from '@/components/skeletons/Shimmer'
import type { Order, OrderStatus } from '@/types'
import { shadows } from '@/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

/** All supported analytics time windows. Imported from analyticsDemo for consistency. */
type Period = AnalyticsPeriod

/**
 * A single bar entry consumed by `react-native-gifted-charts` `<BarChart>`.
 *
 * @property value      - Numeric height of the bar (count or K TZS amount).
 * @property label      - X-axis label displayed below the bar.
 * @property frontColor - Fill colour of the bar; current slot uses a brighter shade.
 */
interface BarEntry {
  value:      number
  label:      string
  frontColor: string
}

/**
 * The structured output of each `build*Data()` function, containing two
 * parallel bar arrays that share the same time-slot labels.
 */
interface ChartData {
  countBars:  BarEntry[]
  amountBars: BarEntry[]
  labels:     string[]
}

// ─── Bar sizing config per period ────────────────────────────────────────────

/**
 * Per-period bar geometry.  `barCount` drives the spacing formula so bars
 * always fill the available chart width regardless of device size.
 */
const BAR_CONFIG: Record<Period, { barWidth: number; minSpacing: number; barCount: number }> = {
  today:   { barWidth: 12, minSpacing: 8,  barCount: 9  },
  week:    { barWidth: 16, minSpacing: 16, barCount: 7  },
  month:   { barWidth: 20, minSpacing: 28, barCount: 4  },
  quarter: { barWidth: 24, minSpacing: 40, barCount: 3  },
  half:    { barWidth: 16, minSpacing: 16, barCount: 6  },
  year:    { barWidth: 10, minSpacing: 6,  barCount: 12 },
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

// ─── Real-data chart builders ─────────────────────────────────────────────────
//
// These functions group the raw orders array into time-slot buckets and build
// the two parallel bar arrays for the dual chart.  They operate entirely in
// memory on the cached orders data — no network call is made.
//
// Amount normalisation: divide by 1,000 so K TZS values fit the Y-axis.

/**
 * Builds chart data for the **Today** view (9 hourly slots, 08:00–16:00).
 */
function buildTodayData(orders: Order[], colors: ChartColors): ChartData {
  const HOURS  = [8, 9, 10, 11, 12, 13, 14, 15, 16]
  const LABELS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm']
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const currentHour = now.getHours()

  const slots = HOURS.map((h, i) => ({
    hour:     h,
    label:    LABELS[i],
    count:    0,
    amount:   0,
    isActive: h === currentHour || (h === 16 && currentHour >= 16),
  }))

  orders.forEach(o => {
    const d = new Date(o.created_at)
    if (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === todayMidnight) {
      const s = slots.find(sl => sl.hour === d.getHours())
      if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
    }
  })

  return {
    labels:     LABELS,
    countBars:  slots.map(s => ({ value: s.count,  label: s.label, frontColor: s.isActive ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map(s => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: s.isActive ? colors.amountHi : colors.amountDim })),
  }
}

/**
 * Builds chart data for the **Week** view (last 7 calendar days).
 *
 * Each slot stores its midnight timestamp as a lookup key.  Orders are
 * matched by stripping the time component from `created_at`.
 */
function buildWeeklyData(orders: Order[], colors: ChartColors): ChartData {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now  = new Date()

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
    countBars:  slots.map(s => ({ value: s.count,  label: s.label, frontColor: s.isToday ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map(s => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: s.isToday ? colors.amountHi : colors.amountDim })),
  }
}

/**
 * Builds chart data for the **Month** view (last 28 days, 4 weekly buckets).
 *
 * Wk 4 covers the most recent 7 days and is highlighted as the current period.
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
    countBars:  slots.map((s, i) => ({ value: s.count,  label: s.label, frontColor: i === 3 ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map((s, i) => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: i === 3 ? colors.amountHi : colors.amountDim })),
  }
}

/**
 * Builds chart data for the **Quarter** view (last 3 calendar months).
 * Slots match exact year + month so they work correctly across year boundaries.
 */
function buildQuarterlyData(orders: Order[], colors: ChartColors): ChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()

  const slots = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
    return { yr: d.getFullYear(), mo: d.getMonth(), label: MONTHS[d.getMonth()], count: 0, amount: 0 }
  })

  orders.forEach(o => {
    const d = new Date(o.created_at)
    const s = slots.find(sl => sl.yr === d.getFullYear() && sl.mo === d.getMonth())
    if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
  })

  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map((s, i) => ({ value: s.count,  label: s.label, frontColor: i === 2 ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map((s, i) => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: i === 2 ? colors.amountHi : colors.amountDim })),
  }
}

/**
 * Builds chart data for the **Half** view (last 6 calendar months).
 * Same slot-matching algorithm as quarterly, extended to 6 months.
 */
function buildBiannualData(orders: Order[], colors: ChartColors): ChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()

  const slots = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { yr: d.getFullYear(), mo: d.getMonth(), label: MONTHS[d.getMonth()], count: 0, amount: 0 }
  })

  orders.forEach(o => {
    const d = new Date(o.created_at)
    const s = slots.find(sl => sl.yr === d.getFullYear() && sl.mo === d.getMonth())
    if (s) { s.count++; s.amount += o.total_quoted_amount ?? 0 }
  })

  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map((s, i) => ({ value: s.count,  label: s.label, frontColor: i === 5 ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map((s, i) => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: i === 5 ? colors.amountHi : colors.amountDim })),
  }
}

/**
 * Builds chart data for the **Year** view (last 12 calendar months).
 * Slots are matched by year + month to handle cross-year ranges correctly.
 */
function buildYearlyData(orders: Order[], colors: ChartColors): ChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
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
    countBars:  slots.map((s, i) => ({ value: s.count,  label: s.label, frontColor: i === 11 ? colors.primary    : colors.primaryDim })),
    amountBars: slots.map((s, i) => ({ value: Math.round(s.amount / 1_000), label: s.label, frontColor: i === 11 ? colors.amountHi : colors.amountDim })),
  }
}

// ─── Status colour config ─────────────────────────────────────────────────────

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
 * Horizontally-scrollable chip row for selecting the analytics time window.
 * Six period options are rendered as pill buttons; the active chip is filled
 * with the primary colour.  A ScrollView is used instead of a fixed-width
 * segment control so all six labels are comfortably accessible on any screen.
 */
const PeriodToggle = memo(function PeriodToggle({
  value,
  onChange,
  rf,
}: {
  value:    Period
  onChange: (p: Period) => void
  rf:       (s: number) => number
}) {
  const { theme } = useTheme()

  const opts: { key: Period; label: string }[] = [
    { key: 'today',   label: 'Today'    },
    { key: 'week',    label: '7 Days'   },
    { key: 'month',   label: '30 Days'  },
    { key: 'quarter', label: '3 Months' },
    { key: 'half',    label: '6 Months' },
    { key: 'year',    label: 'Year'     },
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: 'row', gap: 6, paddingHorizontal: 2 }}
    >
      {opts.map(o => {
        const active = value === o.key
        return (
          <TouchableOpacity
            key={o.key}
            style={[
              {
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: active ? theme.colors.primary : theme.colors.divider,
                backgroundColor: active ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => onChange(o.key)}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontFamily: active ? 'Poppins-SemiBold' : 'Poppins-Medium',
                fontSize: rf(12),
                color: active ? '#fff' : theme.colors.textMuted,
              }}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
})

/**
 * Single KPI chip in the period metrics strip inside the chart card.
 * Displays a numeric value prominently with a descriptive label below it.
 * An optional `accent` colour highlights directional metrics (growth %).
 */
const MetricChip = memo(function MetricChip({
  label,
  value,
  accent,
}: {
  label:   string
  value:   string
  accent?: string
}) {
  const { theme } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: accent ?? theme.colors.text }}>
        {value}
      </Text>
      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10, color: theme.colors.textMuted }}>
        {label}
      </Text>
    </View>
  )
})

/**
 * A single KPI summary card rendered in the three-card row at the top of the screen.
 * The coloured top border visually links each card to its semantic meaning.
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
        ...shadows.subtle,
        alignItems: 'center', gap: 6,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <HugeiconsIcon icon={icon} size={16} color={color} strokeWidth={1.5} />
      </View>
      <Text style={{ fontFamily: 'Poppins-Bold', color, fontSize: rf(24) }}>{value.toLocaleString()}</Text>
      <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textSub, textAlign: 'center', fontSize: rf(11) }}>{label}</Text>
    </Animated.View>
  )
})

/**
 * A single row in the "Recent Orders" list at the bottom of the Analytics screen.
 * Tapping the row navigates to the full Order Detail screen via Expo Router.
 */
const RecentOrderItem = memo(function RecentOrderItem({
  order,
  index,
  rf,
}: {
  order: Order
  index: number
  rf:    (s: number) => number
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
 * Analytics screen — rendered as the sixth tab (`/(tabs)/analytics`).
 *
 * **Demo mode** is active when `orders` is empty (falsy length) and not loading.
 * In demo mode every derived value — chart data, status counts, summary totals,
 * recent orders, and period metrics — is sourced from `analyticsDemo` constants
 * instead of the React Query cache.  This ensures the screen always shows a
 * rich, production-like dashboard rather than an empty state.
 *
 * To wire up live data, remove the `isDemo` branches.  The real-data builders
 * (`buildWeeklyData`, etc.) are already in place; no other structural changes
 * are required.
 */
export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('week')

  const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders()
  const { hp, rf, gap, isTablet, contentMaxWidth } = useResponsive()
  const { width: screenWidth } = useWindowDimensions()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  const chartColors = getChartColors(theme)

  // Trigger a background refetch each time this tab becomes visible.
  useFocusEffect(useCallback(() => { refetch() }, []))

  // ── Two-level demo system ───────────────────────────────────────────────────
  //
  // isGlobalDemo — no real orders exist at all.
  //   Governs: summary KPI cards, status breakdown, recent orders list.
  //
  // isPeriodDemo — IS_DEMO_MODE is on AND the selected time window has no
  //   real orders. Governs: the bar chart and period metrics strip.
  //   Flipping IS_DEMO_MODE to false in analyticsDemo.ts disables this so
  //   the empty-state UI appears in production whenever the API returns
  //   no data for the chosen period.

  // ── Step 1: real chart data from the orders cache ──────────────────────────
  const realChartData = useMemo((): ChartData => {
    if (!orders?.length) return { countBars: [], amountBars: [], labels: [] }
    switch (period) {
      case 'today':   return buildTodayData(orders, chartColors)
      case 'week':    return buildWeeklyData(orders, chartColors)
      case 'month':   return buildMonthlyData(orders, chartColors)
      case 'quarter': return buildQuarterlyData(orders, chartColors)
      case 'half':    return buildBiannualData(orders, chartColors)
      case 'year':    return buildYearlyData(orders, chartColors)
    }
  }, [orders, period, chartColors.primary])

  // Does the current time window contain at least one real order bar?
  const hasPeriodData =
    realChartData.countBars.some(d => d.value > 0) ||
    realChartData.amountBars.some(d => d.value > 0)

  // Chart uses demo data when demo mode is on AND no real bars exist for the period.
  const isPeriodDemo = IS_DEMO_MODE && !hasPeriodData
  // Summary / status / recent orders use demo data only when there are no orders at all.
  const isGlobalDemo = IS_DEMO_MODE && !orders?.length

  // ── Step 2: final chart data — demo fallback or real ───────────────────────
  const chartData = useMemo((): ChartData => {
    if (isPeriodDemo) return buildDemoChartData(period, chartColors) as ChartData
    return realChartData
  }, [isPeriodDemo, realChartData, period, chartColors.primary])

  // ── Period metrics (total, avg, peak, growth) ───────────────────────────────
  const periodMetrics = useMemo((): PeriodMetrics | null => {
    if (isPeriodDemo) return getDemoPeriodMetrics(period)
    if (!hasPeriodData) return null
    return deriveRealPeriodMetrics(
      realChartData.countBars as any,
      realChartData.labels,
      realChartData.amountBars as any,
      period,
    )
  }, [isPeriodDemo, hasPeriodData, realChartData, period])

  // ── Status breakdown ────────────────────────────────────────────────────────
  const statusCounts = useMemo((): Partial<Record<OrderStatus, number>> => {
    if (isGlobalDemo) return DEMO_STATUS_COUNTS
    const counts: Partial<Record<OrderStatus, number>> = {}
    orders?.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
    return counts
  }, [orders, isGlobalDemo])

  // ── Summary totals ──────────────────────────────────────────────────────────
  const totalOrders    = isGlobalDemo ? DEMO_TOTALS.total     : (orders?.length ?? 0)
  const pendingCount   = isGlobalDemo ? DEMO_TOTALS.pending   : (orders ?? []).filter(o => ['awaiting_quote', 'quote_received'].includes(o.status)).length
  const completedCount = isGlobalDemo ? DEMO_TOTALS.completed : (orders ?? []).filter(o => ['dispatched', 'delivered', 'closed'].includes(o.status)).length

  // ── Recent orders (real or demo) ────────────────────────────────────────────
  const recentOrders = useMemo(
    () => isGlobalDemo ? DEMO_RECENT_ORDERS : (orders ?? []).slice(0, 8),
    [orders, isGlobalDemo],
  )

  // ── Chart sizing ────────────────────────────────────────────────────────────
  const chartWidth = Math.max(200, screenWidth - hp * 2 - 32 - (isTablet ? 16 : 0))
  const { barWidth, minSpacing, barCount } = BAR_CONFIG[period]
  const spacing = Math.max(minSpacing, (chartWidth - barWidth * barCount) / (barCount + 1))

  // Chart has renderable content when either real data or demo fallback is present.
  // When IS_DEMO_MODE = false and there are no real orders for the period,
  // hasData = false and the "No orders in this period" empty state appears.
  const hasData = hasPeriodData || isPeriodDemo

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp, paddingBottom: 40 }]}
      >
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

              {/* ── 3. Demo banner — shown whenever the chart is using synthetic data ── */}
              {isPeriodDemo && (
                <Animated.View
                  entering={FadeInDown.delay(200).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
                  style={[styles.demoBanner, { marginTop: gap + 8 }]}
                >
                  <Text style={[styles.demoBannerText, { fontSize: rf(12) }]}>
                    {isGlobalDemo
                      ? 'Demo preview — showing realistic sample data. Your analytics will appear here once you place your first order.'
                      : 'No orders in this period yet — showing demo data so the chart looks production-ready.'}
                  </Text>
                </Animated.View>
              )}

              {/* ── 4. Chart card ── */}
              <Animated.View
                entering={FadeInDown.delay(220).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
                style={[styles.chartCard, { marginTop: gap + 8 }]}
              >
                {/* Chart header: section title + [Demo] badge + period chip row */}
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <HugeiconsIcon icon={OrdersIcon} size={16} color={theme.colors.primary} strokeWidth={1.5} />
                    <Text style={[styles.chartTitle, { fontSize: rf(15) }]}>{t('analytics.chart_title')}</Text>
                    {isPeriodDemo && (
                      <View style={styles.demoBadge}>
                        <Text style={[styles.demoBadgeText, { fontSize: rf(10) }]}>Demo</Text>
                      </View>
                    )}
                  </View>
                  <PeriodToggle value={period} onChange={setPeriod} rf={rf} />
                </View>

                {/* Period metrics strip — Total / Avg / Peak / Growth */}
                {!isLoading && periodMetrics && (
                  <View style={styles.metricsStrip}>
                    <MetricChip
                      label='Orders'
                      value={periodMetrics.totalOrders.toLocaleString()}
                    />
                    <View style={styles.metricDivider} />
                    <MetricChip
                      label={periodMetrics.avgLabel}
                      value={periodMetrics.avgPerSlot.toFixed(1)}
                    />
                    <View style={styles.metricDivider} />
                    <MetricChip
                      label='Peak'
                      value={periodMetrics.peakLabel}
                    />
                    {periodMetrics.growthPct !== null && (
                      <>
                        <View style={styles.metricDivider} />
                        <MetricChip
                          label='Growth'
                          value={`${periodMetrics.growthPct > 0 ? '+' : ''}${periodMetrics.growthPct}%`}
                          accent={periodMetrics.growthPct >= 0 ? theme.colors.success : theme.colors.danger}
                        />
                      </>
                    )}
                  </View>
                )}

                {/* Chart body: skeleton → no-data message → dual mini-charts */}
                <View style={styles.chartBody}>
                  {isLoading ? (
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
                    // Two mini-charts with independent Y-axes avoid the scale-mismatch
                    // problem that arises when plotting counts (0–300) and TZS amounts
                    // (0–24,000 K) on a shared axis.
                    <View style={styles.dualChartWrap}>

                      {/* Mini-chart 1: Order count per slot */}
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

                      {/* Mini-chart 2: Total amount (K TZS) per slot */}
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

              {/* ── 5. Status breakdown ── */}
              {!isLoading && Object.keys(statusCounts).length > 0 && (
                <Animated.View
                  entering={FadeInDown.delay(300).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
                  style={[styles.sectionCard, { marginTop: gap + 8 }]}
                >
                  <Text style={[styles.sectionTitle, { fontSize: rf(15) }]}>
                    {t('analytics.status_breakdown')}
                  </Text>
                  <View style={styles.statusGrid}>
                    {(Object.entries(statusCounts) as [OrderStatus, number][])
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => {
                        const cfg = STATUS_CFG[status]
                        return (
                          <View key={status} style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.statusCount, { color: cfg.color, fontSize: rf(15) }]}>{count.toLocaleString()}</Text>
                            <Text style={[styles.statusLabel, { color: cfg.color, fontSize: rf(10) }]}>{cfg.label}</Text>
                          </View>
                        )
                      })}
                  </View>
                </Animated.View>
              )}

              {/* ── 6. Recent orders list ── */}
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
                  {/* "View All" only makes sense for real orders */}
                  {!isGlobalDemo && orders && orders.length > 8 && (
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

    header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    title:    { fontFamily: 'Poppins-Bold',    color: theme.colors.text },
    subtitle: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub, marginTop: 2 },

    summaryRow: { flexDirection: 'row' },

    // Subtle info banner shown only in demo mode.
    demoBanner: {
      backgroundColor: theme.isDark ? '#1C1A2E' : '#F0EEFF',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.isDark ? '#3730A3' : '#C7D2FE',
    },
    demoBannerText: {
      fontFamily: 'Poppins-Regular',
      color: theme.isDark ? '#A5B4FC' : '#4338CA',
      lineHeight: 18,
    },

    chartCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      ...shadows.subtle,
    },
    chartHeader:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 },
    chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chartTitle:    { fontFamily: 'Poppins-SemiBold', color: theme.colors.text, flex: 1 },

    // Small "Demo" label badge next to the chart title.
    demoBadge: {
      backgroundColor: theme.colors.warningBg,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    demoBadgeText: {
      fontFamily: 'Poppins-SemiBold',
      color: theme.colors.warning,
    },

    // Metrics strip: Total | Avg | Peak | Growth — sits between chip row and charts.
    metricsStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    metricDivider: {
      width: 1,
      height: 28,
      backgroundColor: theme.colors.divider,
    },

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
      ...shadows.subtle,
    },
    sectionTitle: { fontFamily: 'Poppins-SemiBold', color: theme.colors.text, marginBottom: 12 },
    statusGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusPill:   { alignItems: 'center', padding: 10, borderRadius: 12, minWidth: 80, gap: 2 },
    statusCount:  { fontFamily: 'Poppins-Bold' },
    statusLabel:  { fontFamily: 'Poppins-Regular', textAlign: 'center' },

    viewAllBtn:  { marginTop: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.primary, alignItems: 'center' },
    viewAllText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },

    errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    errorText: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    retryBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.primary },
    retryText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },
  })
}
