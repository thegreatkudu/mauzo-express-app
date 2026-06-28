/**
 * @file analyticsDemo.ts
 * @description Production-quality demo datasets for the Analytics screen.
 *
 * Simulates realistic B2B ordering behaviour on the Mauzo platform:
 *   • Weekday-heavy activity (Mon–Fri ≈ 85 % of daily orders)
 *   • Gradual month-over-month growth (~8–12 %)
 *   • Seasonal spikes in Dec and Jun; Jan/Aug post-holiday dip
 *   • Typical Tanzania B2B order values: 80,000–500,000 TZS
 *   • Anchored to 2026-06-28 (Saturday) — labels auto-adjust to the
 *     running date so the chart always looks "current"
 *
 * Swap-ready architecture:
 *   The exported build functions accept the same DemoChartPalette the
 *   screen derives from its theme.  To replace demo data with live API
 *   responses, substitute each buildDemo* call with an equivalent
 *   buildFromOrders* call — the return shape (DemoChartData) is identical.
 */

import type { Order, OrderStatus } from '@/types'

// ─── Demo mode master switch ───────────────────────────────────────────────────
//
// Set IS_DEMO_MODE = true during development so the chart fills with realistic
// sample data whenever a selected time period has no real orders yet.
// Flip to false before connecting to the live backend — the empty-state UI
// will then appear automatically whenever the API returns no data.

export const IS_DEMO_MODE = true

// ─── Shared types ──────────────────────────────────────────────────────────────

/** Colour tokens passed in by the parent so demo data honours the active theme. */
export interface DemoChartPalette {
  primary:    string
  primaryDim: string
  amountHi:   string
  amountDim:  string
}

/** Single bar entry — same shape as the BarEntry consumed by <BarChart>. */
export interface DemoBarEntry {
  value:      number
  label:      string
  frontColor: string
}

/** Parallel bar arrays for the dual mini-chart (counts + K TZS amounts). */
export interface DemoChartData {
  countBars:  DemoBarEntry[]
  amountBars: DemoBarEntry[]
  labels:     string[]
}

/** Summary analytics computed from — or simulated for — the selected period. */
export interface PeriodMetrics {
  totalOrders:  number
  avgPerSlot:   number          // orders per bar slot (hr / day / wk / mo)
  avgLabel:     string          // "Avg/Hr" | "Avg/Day" | "Avg/Wk" | "Avg/Mo"
  peakLabel:    string          // label of the highest-count slot
  growthPct:    number | null   // vs. equivalent previous period; null = unknown
  totalAmountK: number          // total TZS ÷ 1,000 for the period
}

// ─── Analytics period type ─────────────────────────────────────────────────────

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'quarter' | 'half' | 'year'

// ─── Raw demo datasets ─────────────────────────────────────────────────────────
//
// Each sub-array runs slot-0 (oldest) → slot-N (newest / current).

/** TODAY — 9 hourly buckets 08:00–16:00 on a Saturday. */
const TODAY_COUNTS  = [1,  3,  4,  5,  2,  1,  3,  3,  2]
const TODAY_AMOUNTS = [80, 220, 310, 390, 140, 90, 230, 230, 140]  // K TZS
const TODAY_LABELS  = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm']

/**
 * WEEK — counts / amounts indexed by JS day-of-week (Sun=0 … Sat=6).
 * The build function maps actual calendar days to these base values so
 * the bars are consistent regardless of which day of the week "today" is.
 */
const WEEK_COUNTS_BY_DOW  = [3,  15, 22, 18, 25, 19,  7]
const WEEK_AMOUNTS_BY_DOW = [180, 1120, 1680, 1290, 1890, 1450, 530]  // K TZS

/** MONTH — last 30 days split into 4 weekly buckets. Wk 4 = current week. */
const MONTH_COUNTS  = [62,   77,   70,   88]
const MONTH_AMOUNTS = [4450, 5720, 5190, 6610]  // K TZS

/** QUARTER — last 3 calendar months. Labels generated dynamically. */
const QUARTER_COUNTS  = [285,   271,   295]
const QUARTER_AMOUNTS = [21800, 20700, 22900]  // K TZS

/** HALF — last 6 calendar months. Jan dip reflects post-holiday pattern. */
const HALF_COUNTS  = [221,   247,   263,   285,   271,   295]
const HALF_AMOUNTS = [16800, 19100, 20300, 21800, 20700, 22900]  // K TZS

/**
 * YEAR — last 12 calendar months (Jul 2025 → Jun 2026).
 * ~34 % total growth; Dec and Jun are seasonal peaks; Jan dips post-holiday.
 */
const YEAR_COUNTS  = [198,   224,   241,   268,   252,   289,   221,   247,   263,   285,   271,   295]
const YEAR_AMOUNTS = [14800, 17200, 18500, 20600, 19400, 22500, 16900, 19200, 20400, 22100, 21000, 23100]

/** Growth vs. the equivalent previous period (positive = improvement). */
const GROWTH_PCT: Record<AnalyticsPeriod, number> = {
  today:    18.2,
  week:     13.5,
  month:     8.9,
  quarter:  22.4,
  half:     31.6,
  year:     34.2,
}

/** Avg-per-slot label for each period. */
const AVG_LABEL: Record<AnalyticsPeriod, string> = {
  today:   'Avg/Hr',
  week:    'Avg/Day',
  month:   'Avg/Wk',
  quarter: 'Avg/Mo',
  half:    'Avg/Mo',
  year:    'Avg/Mo',
}

// ─── Status breakdown ──────────────────────────────────────────────────────────

/**
 * All-time status distribution for a B2B platform that has been running ~1 year.
 * The bulk of orders are closed (fully completed); a small active pipeline
 * of awaiting_quote + quote_received reflects current daily operations.
 */
export const DEMO_STATUS_COUNTS: Partial<Record<OrderStatus, number>> = {
  awaiting_quote:  23,
  quote_received:  41,
  accepted:        67,
  rejected:        64,
  dispatched:      38,
  delivered:      512,
  closed:        2243,
  cancelled:       66,
}

/** Pre-computed all-time totals that populate the SummaryCard row. */
export const DEMO_TOTALS = {
  total:     3_054,   // sum of DEMO_STATUS_COUNTS
  pending:      64,   // awaiting_quote + quote_received
  completed: 2_793,   // dispatched + delivered + closed
}

// ─── Recent orders demo data ───────────────────────────────────────────────────

/** Eight realistic recent orders covering a variety of Tanzanian B2B suppliers. */
export const DEMO_RECENT_ORDERS: Order[] = [
  {
    order_id: 'demo-0001-4000-8000-100000000001',
    created_at: '2026-06-28T10:14:00Z',
    status: 'awaiting_quote',
    total_quoted_amount: null,
    supplier: { id: 1, business_name: 'Karibu Wholesale Ltd',       location: 'Dar es Salaam', category: { id: 1, name: 'FMCG' },         product_count: 142 },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0002-4000-8000-100000000002',
    created_at: '2026-06-27T14:30:00Z',
    status: 'quote_received',
    total_quoted_amount: 284_500,
    supplier: { id: 2, business_name: 'Safari Foods & Beverages',    location: 'Arusha',         category: { id: 2, name: 'Food & Bev' },   product_count: 87  },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0003-4000-8000-100000000003',
    created_at: '2026-06-26T09:05:00Z',
    status: 'accepted',
    total_quoted_amount: 512_000,
    supplier: { id: 3, business_name: 'Mlima Electronics',           location: 'Dar es Salaam', category: { id: 3, name: 'Electronics' },   product_count: 63  },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0004-4000-8000-100000000004',
    created_at: '2026-06-25T11:45:00Z',
    status: 'dispatched',
    total_quoted_amount: 178_000,
    supplier: { id: 4, business_name: 'Savanna Agro Supplies',       location: 'Dodoma',         category: { id: 4, name: 'Agriculture' },   product_count: 210 },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0005-4000-8000-100000000005',
    created_at: '2026-06-24T08:20:00Z',
    status: 'delivered',
    total_quoted_amount: 345_000,
    supplier: { id: 5, business_name: 'Nguvu Hardware & Steel',      location: 'Mwanza',         category: { id: 5, name: 'Hardware' },      product_count: 328 },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0006-4000-8000-100000000006',
    created_at: '2026-06-23T15:10:00Z',
    status: 'closed',
    total_quoted_amount: 92_000,
    supplier: { id: 6, business_name: 'Bahari Pharma Distributors',  location: 'Dar es Salaam', category: { id: 6, name: 'Pharma' },        product_count: 159 },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0007-4000-8000-100000000007',
    created_at: '2026-06-22T13:00:00Z',
    status: 'delivered',
    total_quoted_amount: 228_000,
    supplier: { id: 7, business_name: 'Pwani Textiles Co.',           location: 'Tanga',          category: { id: 7, name: 'Textiles' },      product_count: 76  },
    items: [], quotations: [],
  },
  {
    order_id: 'demo-0008-4000-8000-100000000008',
    created_at: '2026-06-21T10:30:00Z',
    status: 'cancelled',
    total_quoted_amount: 156_000,
    supplier: { id: 8, business_name: 'Jua Kali Building Supplies',  location: 'Moshi',          category: { id: 8, name: 'Construction' },  product_count: 194 },
    items: [], quotations: [],
  },
]

// ─── Bar entry factory ─────────────────────────────────────────────────────────

function bar(value: number, label: string, color: string): DemoBarEntry {
  return { value, label, frontColor: color }
}

// ─── Per-period chart data builders ───────────────────────────────────────────

function buildDemoTodayData(p: DemoChartPalette): DemoChartData {
  const currentHour = new Date().getHours()
  // Highlight the slot whose hour matches the current hour (8–16).
  const activeIdx = Math.min(Math.max(currentHour - 8, 0), TODAY_LABELS.length - 1)
  return {
    labels:     TODAY_LABELS,
    countBars:  TODAY_COUNTS.map((v, i)  => bar(v, TODAY_LABELS[i], i === activeIdx ? p.primary   : p.primaryDim)),
    amountBars: TODAY_AMOUNTS.map((v, i) => bar(v, TODAY_LABELS[i], i === activeIdx ? p.amountHi  : p.amountDim)),
  }
}

function buildDemoWeekData(p: DemoChartPalette): DemoChartData {
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const dow = d.getDay()
    return {
      label:   DAY_NAMES[dow],
      count:   WEEK_COUNTS_BY_DOW[dow],
      amount:  WEEK_AMOUNTS_BY_DOW[dow],
      isToday: i === 6,
    }
  })
  return {
    labels:     slots.map(s => s.label),
    countBars:  slots.map(s => bar(s.count,  s.label, s.isToday ? p.primary   : p.primaryDim)),
    amountBars: slots.map(s => bar(s.amount, s.label, s.isToday ? p.amountHi  : p.amountDim)),
  }
}

function buildDemoMonthData(p: DemoChartPalette): DemoChartData {
  const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
  return {
    labels,
    countBars:  MONTH_COUNTS.map((v, i)  => bar(v, labels[i], i === 3 ? p.primary  : p.primaryDim)),
    amountBars: MONTH_AMOUNTS.map((v, i) => bar(v, labels[i], i === 3 ? p.amountHi : p.amountDim)),
  }
}

function buildDemoQuarterData(p: DemoChartPalette): DemoChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const labels = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
    return MONTHS[d.getMonth()]
  })
  return {
    labels,
    countBars:  QUARTER_COUNTS.map((v, i)  => bar(v, labels[i], i === 2 ? p.primary  : p.primaryDim)),
    amountBars: QUARTER_AMOUNTS.map((v, i) => bar(v, labels[i], i === 2 ? p.amountHi : p.amountDim)),
  }
}

function buildDemoHalfData(p: DemoChartPalette): DemoChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return MONTHS[d.getMonth()]
  })
  return {
    labels,
    countBars:  HALF_COUNTS.map((v, i)  => bar(v, labels[i], i === 5 ? p.primary  : p.primaryDim)),
    amountBars: HALF_AMOUNTS.map((v, i) => bar(v, labels[i], i === 5 ? p.amountHi : p.amountDim)),
  }
}

function buildDemoYearData(p: DemoChartPalette): DemoChartData {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const labels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return MONTHS[d.getMonth()]
  })
  return {
    labels,
    countBars:  YEAR_COUNTS.map((v, i)  => bar(v, labels[i], i === 11 ? p.primary  : p.primaryDim)),
    amountBars: YEAR_AMOUNTS.map((v, i) => bar(v, labels[i], i === 11 ? p.amountHi : p.amountDim)),
  }
}

/**
 * Main entry point — returns demo chart data for the given period and palette.
 * Call this when the real orders array is empty to render a production-like chart.
 */
export function buildDemoChartData(period: AnalyticsPeriod, palette: DemoChartPalette): DemoChartData {
  switch (period) {
    case 'today':   return buildDemoTodayData(palette)
    case 'week':    return buildDemoWeekData(palette)
    case 'month':   return buildDemoMonthData(palette)
    case 'quarter': return buildDemoQuarterData(palette)
    case 'half':    return buildDemoHalfData(palette)
    case 'year':    return buildDemoYearData(palette)
  }
}

// ─── Period metrics ────────────────────────────────────────────────────────────

/** Pre-computed metrics for each demo period (totals verified against raw arrays). */
const DEMO_METRICS: Record<AnalyticsPeriod, PeriodMetrics> = {
  today:   { totalOrders:    24, avgPerSlot:   2.7, avgLabel: AVG_LABEL.today,   peakLabel: '11am', growthPct:  18.2, totalAmountK:   1_830 },
  week:    { totalOrders:   109, avgPerSlot:  15.6, avgLabel: AVG_LABEL.week,    peakLabel: 'Thu',  growthPct:  13.5, totalAmountK:   8_140 },
  month:   { totalOrders:   297, avgPerSlot:  74.3, avgLabel: AVG_LABEL.month,   peakLabel: 'Wk 4', growthPct:   8.9, totalAmountK:  21_970 },
  quarter: { totalOrders:   851, avgPerSlot: 283.7, avgLabel: AVG_LABEL.quarter, peakLabel: 'Jun',  growthPct:  22.4, totalAmountK:  65_400 },
  half:    { totalOrders: 1_582, avgPerSlot: 263.7, avgLabel: AVG_LABEL.half,    peakLabel: 'Jun',  growthPct:  31.6, totalAmountK: 121_600 },
  year:    { totalOrders: 3_054, avgPerSlot: 254.5, avgLabel: AVG_LABEL.year,    peakLabel: 'Jun',  growthPct:  34.2, totalAmountK: 235_700 },
}

/** Returns pre-computed metrics for the selected demo period. */
export function getDemoPeriodMetrics(period: AnalyticsPeriod): PeriodMetrics {
  return DEMO_METRICS[period]
}

/**
 * Derives period metrics directly from a real chart dataset.
 * Growth percentage is omitted (`null`) because computing it would require
 * a second API call for the previous equivalent period.
 */
export function deriveRealPeriodMetrics(
  countBars: DemoBarEntry[],
  labels:    string[],
  amountBars: DemoBarEntry[],
  period:    AnalyticsPeriod,
): PeriodMetrics {
  const counts  = countBars.map(b => b.value)
  const amounts = amountBars.map(b => b.value)
  const total   = counts.reduce((a, b) => a + b, 0)
  const peakIdx = counts.indexOf(Math.max(...counts))
  return {
    totalOrders:  total,
    avgPerSlot:   counts.length > 0 ? Math.round((total / counts.length) * 10) / 10 : 0,
    avgLabel:     AVG_LABEL[period],
    peakLabel:    labels[peakIdx] ?? '—',
    growthPct:    null,
    totalAmountK: amounts.reduce((a, b) => a + b, 0),
  }
}
