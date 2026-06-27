/**
 * @file index.tsx  (tabs)
 * @description Home screen — the first tab and primary landing surface of the
 * Mauzo B2B ordering app.
 *
 * Purpose:
 * Gives the authenticated buyer an immediate, high-level picture of their
 * ordering activity and quick pathways into the core workflows.
 *
 * Sections rendered (top → bottom on phone; two-column on tablet landscape):
 *   1. Header          — Time-appropriate greeting + business name + Cart/Notifications shortcuts
 *   2. Trial banner    — Urgent amber warning shown ≤7 days before trial expiry
 *   3. Order Overview  — DashboardCard hero (order counts + total spend by period)
 *   4. Quick Actions   — Four 2×2 shortcut cards: Suppliers / Orders / Cart / Analytics
 *   5. Recent Orders   — Live list of the 5 most recent orders with inline skeleton
 *   6. Status Guide    — Onboarding reference explaining each order status
 *
 * Data sources:
 * - `useOrderSummary()` — Lightweight summary endpoint for order counts (active /
 *   pending / accepted). Separate from `useOrders` to keep the hero card fast.
 * - `useOrders()`       — Full order list used for spend totals and recent orders.
 *   Shares the `['orders']` React Query cache with the Orders tab, so switching
 *   tabs never triggers a duplicate network request.
 * - `useAuthStore`      — Profile data (business name, subscription state).
 * - `useCartStore`      — Live cart item count for the header badge.
 * - `useNotifications`  — Unread notification count for the header badge.
 *
 * Layout variants:
 * - Phone (portrait + landscape): Single-column stacked sections.
 * - Tablet landscape: Two-column layout — left column holds Dashboard, Actions,
 *   and Recent Orders; right column holds the Status Guide.
 *
 * Animation timing (delay ms, relative to component mount):
 *   0   — Header
 *   30  — Trial banner
 *   200 — DashboardCard (fires 200 ms after skeleton disappears, skeleton-first)
 *   340 + stagger(i, 55) — Individual QuickAction cards
 *   500 + stagger(i, 40) — Individual recent order rows
 */

import { useEffect, useMemo } from 'react'
import {
  Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { useTranslation } from 'react-i18next'
import { HomeStatsSkeleton } from '@/components/skeletons'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useOrders, useOrderSummary } from '@/hooks/useOrders'
import { useNotifications, useNotificationPolling } from '@/hooks/useNotifications'
import { useResponsive } from '@/hooks/useResponsive'
import { useUiStore } from '@/store/ui.store'
import { spring, listStagger } from '@/constants/animations'
import DashboardCard from '@/components/home/DashboardCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import {
  NotificationIcon,
  SuppliersNavIcon,
  OrdersIcon,
  CartIcon,
  InfoIcon,
  ClockIcon,
  CheckCircleIcon,
  ReceiptIcon,
  AnalyticsIcon,
} from '@/constants/icons'
import type { Order } from '@/types'

// ─── SpringPressable ──────────────────────────────────────────────────────────

/**
 * A lightweight animated wrapper for touchable elements that applies a spring
 * scale press effect (1.0 → 0.95 on press-in, back to 1.0 on press-out).
 *
 * Used for the Cart and Notifications buttons in the header, and for the
 * "Subscribe" link inside the trial banner. These elements don't need the full
 * `QuickAction` treatment but still benefit from tactile press feedback.
 *
 * The scale animation runs on the UI thread via Reanimated's worklet system,
 * keeping it at 60 fps regardless of JS bridge congestion.
 *
 * @param children - The element to wrap (icon button, text link, etc.).
 * @param onPress  - Callback invoked after the press gesture completes.
 */
function SpringPressable({
  children,
  onPress,
}: {
  children: React.ReactNode
  onPress: () => void
}) {
  const scale    = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95, spring.press) }}
      onPressOut={() => { scale.value = withSpring(1,    spring.press) }}
      onPress={onPress}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  )
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

/**
 * Root component for the Home tab (`/(tabs)/index`).
 *
 * Orchestrates all data fetching and passes derived values down to the
 * section sub-components as props, keeping each section independently testable
 * and preventing unnecessary re-renders when unrelated state changes.
 *
 * Spend amount calculation (todayAmount / monthAmount / yearAmount):
 * The three amount buckets are derived from the `useOrders()` cache in a single
 * `useMemo` pass. Nesting the date comparisons (year → month → day) avoids
 * iterating the array three times.
 * - `null` amounts (`total_quoted_amount`) are treated as zero so that orders
 *   still awaiting a supplier quotation don't distort the totals.
 */
export default function HomeScreen() {
  // ── Store subscriptions ────────────────────────────────────────────────────
  const profile   = useAuthStore(s => s.profile)
  // Subscribe only to the derived count, not the entire cart state.
  const cartCount = useCartStore(s => s.getItemCount())
  const { fetchCart } = useCartStore()

  // ── Data hooks ─────────────────────────────────────────────────────────────
  // Two separate queries: summary (lightweight) for counts, orders (full) for
  // amounts and the recent orders list. Both share staleTime: 30s in the cache.
  const { data: summary,       isLoading: summaryLoading, refetch: refetchSummary } = useOrderSummary()
  const { data: orders,        isLoading: ordersLoading,  refetch: refetchOrders  } = useOrders()
  const { data: notifications }                                                      = useNotifications()

  const { hp, rf, vgap, gap, isTablet, isLandscape, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()

  const setHomeReady = useUiStore(s => s.setHomeReady)

  // Start background polling for new notifications (push-like experience).
  useNotificationPolling()

  // Hydrate the local cart from the server on initial mount so the header badge
  // reflects any items added on a different device or session.
  useEffect(() => { fetchCart() }, [])

  // Signal the root layout's SplashCover to fade out once the two critical
  // queries have resolved. The cover keeps the orange gradient visible until
  // this moment so the transition from splash → home feels seamless.
  useEffect(() => {
    if (!summaryLoading && !ordersLoading) {
      setHomeReady(true)
    }
  }, [summaryLoading, ordersLoading])

  // ── Derived values ─────────────────────────────────────────────────────────
  const unreadCount    = notifications?.filter(n => !n.is_read).length ?? 0
  const sub            = profile?.subscription
  const isOnTrial      = sub?.type === 'trial'
  const daysLeft       = sub?.days_remaining ?? 0

  // Order counts from the lightweight summary endpoint.
  const activeOrders   = summary?.active_count             ?? 0
  const pendingQuotes  = summary?.pending_quotation_count  ?? 0
  const acceptedOrders = summary?.accepted_quotation_count ?? 0

  // Spend totals derived client-side from the full orders cache.
  // Capture `now` outside the memo so the reference is stable across renders.
  const now = new Date()
  const { todayAmount, monthAmount, yearAmount } = useMemo(() => {
    let todayAmt = 0, monthAmt = 0, yearAmt = 0

    // Single pass: nest comparisons from widest (year) to narrowest (day)
    // so each order is checked at most three times instead of running
    // three separate filter passes over the array.
    ;(orders ?? []).forEach(o => {
      const d   = new Date(o.created_at)
      const amt = o.total_quoted_amount ?? 0 // treat un-quoted orders as 0

      if (d.getFullYear() === now.getFullYear()) {
        yearAmt += amt
        if (d.getMonth() === now.getMonth()) {
          monthAmt += amt
          if (d.getDate() === now.getDate()) todayAmt += amt
        }
      }
    })

    return { todayAmount: todayAmt, monthAmount: monthAmt, yearAmount: yearAmt }
  }, [orders])

  // Cap the home-screen preview at 5 orders; full list lives in the Orders tab.
  const recentOrders = useMemo(() => (orders ?? []).slice(0, 5), [orders])

  /** Triggers a coordinated refresh of all three data sources on pull-to-refresh. */
  function onRefresh() {
    refetchSummary()
    refetchOrders()
    fetchCart()
  }

  // Tablet landscape gets a two-column layout; all other configurations are single-column.
  const twoColLayout = isTablet && isLandscape

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp, paddingBottom: 32 }]}
        refreshControl={
          // `refreshing` is intentionally false — the individual query states control
          // their own loading indicators rather than a single global spinner.
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor='#CE4002' />
        }
      >
        {/* Constrain content width on large tablets to prevent cards stretching too wide. */}
        <View style={contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : undefined}>

          {/* ── 1. Header ── */}
          <Animated.View
            entering={FadeInDown.delay(0).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
            style={[styles.header, { paddingTop: vgap, paddingBottom: vgap * 0.75 }]}
          >
            <View style={styles.headerLeft}>
              {/* Time-based greeting key resolves to morning / afternoon / evening. */}
              <Text style={[styles.greeting, { fontSize: rf(13) }]}>
                {t(`home.greeting_${getGreeting()}`)}
              </Text>
              <Text
                style={[styles.bizName, { fontSize: rf(20), maxWidth: isTablet ? 420 : 240 }]}
                numberOfLines={1}
              >
                {profile?.business_name ?? 'Welcome'}
              </Text>
            </View>

            {/* Cart and Notifications shortcut buttons with live badge counts. */}
            <View style={styles.headerActions}>
              <SpringPressable onPress={() => router.push('/(tabs)/cart')}>
                <View style={[styles.notifBtn, isTablet && styles.notifBtnTablet]}>
                  <HugeiconsIcon icon={CartIcon} size={isTablet ? 24 : 22} color='#374151' strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </View>
              </SpringPressable>

              <SpringPressable onPress={() => router.push('/notifications')}>
                <View style={[styles.notifBtn, isTablet && styles.notifBtnTablet]}>
                  <HugeiconsIcon icon={NotificationIcon} size={isTablet ? 24 : 22} color='#374151' strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </View>
              </SpringPressable>
            </View>
          </Animated.View>

          {/* ── 2. Trial expiry banner ──
              Only rendered when the subscription type is "trial" AND fewer than
              8 days remain. The urgency threshold of 7 days gives the buyer
              enough time to contact the administrator before losing access. */}
          {isOnTrial && daysLeft <= 7 && (
            <Animated.View
              entering={FadeInDown.delay(30).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.trialBanner, { borderRadius: isTablet ? 16 : 14, padding: isTablet ? 16 : 14 }]}
              >
                <HugeiconsIcon icon={InfoIcon} size={18} color='#D97706' strokeWidth={2} />
                {/* i18next pluralisation: uses 'trial_banner' (singular) or 'trial_banner_plural'. */}
                <Text style={[styles.trialText, { fontSize: rf(13) }]}>
                  {t(daysLeft !== 1 ? 'home.trial_banner_plural' : 'home.trial_banner', { count: daysLeft })}
                </Text>
                <SpringPressable onPress={() => router.push('/subscription')}>
                  <Text style={[styles.trialLink, { fontSize: rf(13) }]}>{t('home.subscribe')}</Text>
                </SpringPressable>
              </LinearGradient>
            </Animated.View>
          )}

          {/* ── 3-6. Main content — phone vs. tablet layout ── */}
          {twoColLayout ? (
            // Tablet landscape: left (3 flex units) + right (2 flex units)
            <View style={styles.twoColRow}>
              <View style={styles.twoColLeft}>
                <DashboardSection
                  summaryLoading={summaryLoading}
                  activeOrders={activeOrders}
                  pendingQuotes={pendingQuotes}
                  acceptedOrders={acceptedOrders}
                  todayAmount={todayAmount}
                  monthAmount={monthAmount}
                  yearAmount={yearAmount}
                  ordersLoading={ordersLoading}
                  vgap={vgap}
                  rf={rf}
                />
                <ActionsSection cartCount={cartCount} vgap={vgap} rf={rf} gap={gap} />
                <RecentOrdersSection orders={recentOrders} ordersLoading={ordersLoading} vgap={vgap} rf={rf} />
              </View>
              <View style={styles.twoColRight}>
                {/* Status guide moved to the right column on tablet so it's always visible. */}
                <StatusGuideSection vgap={vgap} rf={rf} />
              </View>
            </View>
          ) : (
            // Phone: linear stack
            <>
              <DashboardSection
                summaryLoading={summaryLoading}
                activeOrders={activeOrders}
                pendingQuotes={pendingQuotes}
                acceptedOrders={acceptedOrders}
                todayAmount={todayAmount}
                monthAmount={monthAmount}
                yearAmount={yearAmount}
                ordersLoading={ordersLoading}
                vgap={vgap}
                rf={rf}
              />
              <ActionsSection cartCount={cartCount} vgap={vgap} rf={rf} gap={gap} />
              <RecentOrdersSection orders={recentOrders} ordersLoading={ordersLoading} vgap={vgap} rf={rf} />
              <StatusGuideSection vgap={vgap} rf={rf} />
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Section sub-components ───────────────────────────────────────────────────
//
// Each section is extracted into its own function component so that:
//   a) Re-renders caused by one section's state don't ripple into others.
//   b) The tablet two-column layout can place sections freely without
//      duplication of JSX.
//   c) Each section is independently readable and testable.

/**
 * Renders the "Order Overview" section: section title and DashboardCard hero.
 *
 * Skeleton-first sequence:
 * 1. `HomeStatsSkeleton` shimmer plays while `summaryLoading` is true.
 * 2. When data arrives the skeleton unmounts and `DashboardCard` mounts.
 * 3. `FadeInDown.delay(200)` gives a 200 ms breathing room so the card
 *    slides in after the skeleton disappears rather than popping in abruptly.
 *
 * @param summaryLoading - `true` while the order-summary endpoint is pending.
 * @param activeOrders   - Count of orders in an active/in-progress state.
 * @param pendingQuotes  - Count of orders awaiting buyer acceptance of a quote.
 * @param acceptedOrders - Count of orders the buyer has accepted.
 * @param todayAmount    - Sum of quoted amounts for orders placed today (TZS).
 * @param monthAmount    - Sum for the current calendar month (TZS).
 * @param yearAmount     - Sum for the current calendar year (TZS).
 * @param ordersLoading  - `true` while the full orders list is being fetched.
 * @param vgap           - Vertical gap between sections (from `useResponsive`).
 * @param rf             - Responsive font-scale function.
 */
function DashboardSection({
  summaryLoading, activeOrders, pendingQuotes, acceptedOrders,
  todayAmount, monthAmount, yearAmount, ordersLoading,
  vgap, rf,
}: {
  summaryLoading: boolean; activeOrders: number; pendingQuotes: number; acceptedOrders: number
  todayAmount: number; monthAmount: number; yearAmount: number; ordersLoading: boolean
  vgap: number; rf: (s: number) => number
}) {
  const { t } = useTranslation()

  return (
    <View style={{ marginTop: vgap }}>
      <Text style={[styles.sectionTitle, { fontSize: rf(16) }]}>{t('home.order_overview')}</Text>

      {summaryLoading ? (
        <HomeStatsSkeleton />
      ) : (
        // 200 ms delay ensures the card entrance plays after the skeleton has gone,
        // not simultaneously with it unmounting.
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(spring.hero.damping).stiffness(spring.hero.stiffness)}
        >
          <DashboardCard
            activeOrders={activeOrders}
            pendingOrders={pendingQuotes}
            acceptedOrders={acceptedOrders}
            todayAmount={todayAmount}
            monthAmount={monthAmount}
            yearAmount={yearAmount}
            ordersLoading={ordersLoading}
          />
        </Animated.View>
      )}
    </View>
  )
}

/**
 * Renders the "Quick Actions" 2×2 grid section.
 *
 * Each `QuickAction` card is an independent animated pressable that navigates
 * to one of the four primary destinations in the app:
 *   1. Browse Suppliers — Discover and browse supplier product catalogues.
 *   2. My Orders       — View and manage all past and current orders.
 *   3. My Cart         — Review items staged for the next order.
 *   4. Analytics       — View order volume and spend trend charts.
 *
 * The Cart action's subtitle dynamically reflects the current item count,
 * showing "N items" when the cart is non-empty or "Empty" otherwise, giving
 * the buyer a glanceable cart status without needing to open the tab.
 *
 * @param cartCount - Live item count from the Zustand cart store.
 * @param vgap      - Vertical spacing above the section.
 * @param rf        - Responsive font-scale function.
 * @param gap       - Gap between the 2×2 grid cells.
 */
function ActionsSection({
  cartCount, vgap, rf, gap,
}: {
  cartCount: number; vgap: number; rf: (s: number) => number; gap: number
}) {
  const { t } = useTranslation()

  return (
    <View style={{ marginTop: vgap }}>
      <Text style={[styles.sectionTitle, { fontSize: rf(16) }]}>{t('home.quick_actions')}</Text>

      <View style={[styles.actionsGrid, { gap }]}>
        <QuickAction
          index={0}
          icon={SuppliersNavIcon}
          label={t('home.action_browse_suppliers')}
          subtitle={t('home.action_browse_suppliers_sub')}
          color='#CE4002'
          bg='#FEF0E6'
          rf={rf}
          onPress={() => router.push('/(tabs)/suppliers')}
        />
        <QuickAction
          index={1}
          icon={OrdersIcon}
          label={t('home.action_my_orders')}
          subtitle={t('home.action_my_orders_sub')}
          color='#7C3AED'
          bg='#EDE9FE'
          rf={rf}
          onPress={() => router.push('/(tabs)/orders')}
        />
        <QuickAction
          index={2}
          icon={CartIcon}
          label={t('home.action_my_cart')}
          // Dynamically reflect cart state so the buyer sees live item count at a glance.
          subtitle={
            cartCount > 0
              ? t(cartCount !== 1 ? 'home.action_cart_items_other' : 'home.action_cart_items_one', { count: cartCount })
              : t('home.action_cart_empty')
          }
          color='#2563EB'
          bg='#DBEAFE'
          rf={rf}
          onPress={() => router.push('/(tabs)/cart')}
        />
        <QuickAction
          index={3}
          icon={AnalyticsIcon}
          label={t('nav.analytics')}
          subtitle={t('analytics.subtitle')}
          color='#059669'
          bg='#D1FAE5'
          rf={rf}
          // `as any` suppresses a TypeScript route-type error that resolves automatically
          // the next time `expo start` regenerates Expo Router's typed route declarations.
          onPress={() => router.push('/(tabs)/analytics' as any)}
        />
      </View>
    </View>
  )
}

/**
 * Renders the "Order Status Guide" reference card.
 *
 * This section helps new buyers understand the order lifecycle without having
 * to navigate away or consult external documentation. Each row describes one
 * status with an icon, label, and a one-line plain-language description.
 *
 * The entire section animates in as a single unit (no per-row stagger) because
 * it's a reference block, not a live data list.
 *
 * On tablet landscape the guide lives in the right column so it's always visible
 * alongside the buyer's active workflow on the left.
 *
 * @param vgap - Vertical spacing above the section.
 * @param rf   - Responsive font-scale function.
 */
function StatusGuideSection({ vgap, rf }: { vgap: number; rf: (s: number) => number }) {
  const { t } = useTranslation()

  /** Ordered steps that mirror the actual order lifecycle progression. */
  const STATUS_STEPS = [
    { icon: ClockIcon,        color: '#9CA3AF', label: t('home.status_awaiting_quote'),  desc: t('home.status_awaiting_quote_desc')  },
    { icon: ReceiptIcon,      color: '#D97706', label: t('home.status_quote_received'),  desc: t('home.status_quote_received_desc')  },
    { icon: CheckCircleIcon,  color: '#059669', label: t('home.status_accepted'),        desc: t('home.status_accepted_desc')        },
    { icon: SuppliersNavIcon, color: '#7C3AED', label: t('home.status_dispatched'),      desc: t('home.status_dispatched_desc')      },
    { icon: CheckCircleIcon,  color: '#2563EB', label: t('home.status_delivered'),       desc: t('home.status_delivered_desc')       },
  ]

  return (
    <View style={{ marginTop: vgap }}>
      <Text style={[styles.sectionTitle, { fontSize: rf(16) }]}>{t('home.status_guide_title')}</Text>
      <View style={styles.statusGuide}>
        {STATUS_STEPS.map((s, i) => (
          <View key={i} style={styles.statusRow}>
            <HugeiconsIcon icon={s.icon} size={16} color={s.color} strokeWidth={1.5} />
            <View style={styles.statusText}>
              <Text style={[styles.statusLabel, { fontSize: rf(13) }]}>{s.label}</Text>
              <Text style={[styles.statusDesc,  { fontSize: rf(12) }]}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

/**
 * Renders a compact preview of the buyer's 5 most recent orders.
 *
 * Design decisions:
 * - Positioned between Quick Actions and Status Guide so the buyer can act
 *   on recent orders (via "View All") without scrolling past the guide.
 * - Returns `null` when loading is complete and there are no orders, so it
 *   doesn't leave a blank section header for new accounts.
 * - Shows 3 skeleton rows during the initial load to prevent layout shift.
 * - The "View All" link in the header navigates directly to the Orders tab.
 *
 * Each row shows: formatted order ID, supplier name, created date (left) +
 * status badge and quoted amount if available (right).
 *
 * @param orders        - Pre-sliced array of up to 5 most recent orders.
 * @param ordersLoading - `true` while the orders query is in flight.
 * @param vgap          - Vertical spacing above the section.
 * @param rf            - Responsive font-scale function.
 */
function RecentOrdersSection({
  orders, ordersLoading, vgap, rf,
}: {
  orders: Order[]
  ordersLoading: boolean
  vgap: number
  rf: (s: number) => number
}) {
  const { t } = useTranslation()

  // Don't render an empty section for new accounts with no orders.
  if (!ordersLoading && orders.length === 0) return null

  return (
    <View style={{ marginTop: vgap }}>
      {/* Section header: title on the left, "View All" link on the right. */}
      <Animated.View
        entering={FadeInDown.delay(480).springify().damping(spring.list.damping).stiffness(spring.list.stiffness)}
        style={styles.recentHeader}
      >
        <Text style={[styles.sectionTitle, { fontSize: rf(16), marginBottom: 0 }]}>
          {t('home.recent_orders')}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/orders')} activeOpacity={0.7}>
          <Text style={[styles.recentViewAll, { fontSize: rf(13) }]}>{t('home.view_all')}</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={[styles.recentCard, { marginTop: 12 }]}>
        {ordersLoading ? (
          // 3 skeleton rows with staggered widths to simulate realistic content.
          Array.from({ length: 3 }, (_, i) => (
            <View key={i} style={[styles.recentRow, i < 2 && styles.recentRowBorder]}>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={[styles.skeletonLine, { width: '45%' }]} />
                <View style={[styles.skeletonLine, { width: '60%', height: 10 }]} />
              </View>
              <View style={[styles.skeletonLine, { width: 70, height: 22, borderRadius: 8 }]} />
            </View>
          ))
        ) : (
          orders.map((o, i) => (
            // Each row enters with a stagger so the list cascades rather than popping in all at once.
            <Animated.View
              key={o.order_id}
              entering={FadeInDown
                .delay(500 + listStagger(i, 40))
                .springify()
                .damping(spring.list.damping)
                .stiffness(spring.list.stiffness)}
            >
              <TouchableOpacity
                style={[styles.recentRow, i < orders.length - 1 && styles.recentRowBorder]}
                onPress={() => router.push(`/order/${o.order_id}`)}
                activeOpacity={0.85}
              >
                {/* Left side: order identifier, supplier, and date */}
                <View style={styles.recentLeft}>
                  <Text style={[styles.recentId,       { fontSize: rf(13) }]}>{formatOrderId(o.order_id)}</Text>
                  <Text style={[styles.recentSupplier, { fontSize: rf(12) }]} numberOfLines={1}>
                    {o.supplier.business_name}
                  </Text>
                  <Text style={[styles.recentDate,     { fontSize: rf(11) }]}>{formatDate(o.created_at)}</Text>
                </View>

                {/* Right side: status badge and quoted amount (if available) */}
                <View style={styles.recentRight}>
                  <StatusBadge status={o.status} size='sm' />
                  {/* Only render the amount once the supplier has submitted a quotation. */}
                  {o.total_quoted_amount != null && (
                    <Text style={[styles.recentAmount, { fontSize: rf(12) }]}>
                      TZS {o.total_quoted_amount.toLocaleString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </View>
    </View>
  )
}

/**
 * A self-animating, pressable shortcut card in the Quick Actions 2×2 grid.
 *
 * Each card manages its own press-scale animation independently using a
 * `useSharedValue`, so simultaneous presses on different cards don't interfere.
 *
 * The outer `Animated.View` drives the entrance stagger (delayed by `index`);
 * the inner `Animated.View` drives the press-spring transform so the two
 * animations compose cleanly without conflicting.
 *
 * @param index    - Zero-based position in the grid; determines entrance delay.
 * @param icon     - HugeIcons icon definition for the card's icon badge.
 * @param label    - Primary label text displayed below the icon.
 * @param subtitle - Secondary line, typically the destination description or live state.
 * @param color    - Accent colour for the icon and badge background.
 * @param bg       - Light background tint for the icon badge container.
 * @param rf       - Responsive font-scale function.
 * @param onPress  - Navigation callback invoked on tap.
 */
function QuickAction({
  index, icon, label, subtitle, color, bg, rf, onPress,
}: {
  index: number; icon: any; label: string; subtitle: string
  color: string; bg: string; onPress: () => void
  rf: (s: number) => number
}) {
  const scale     = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    // Outer view: staggered FadeInDown entrance. Width is 47.5% to create
    // two columns with a natural gap from the parent's flex `gap` prop.
    <Animated.View
      entering={FadeInDown
        .delay(340 + listStagger(index, 55))
        .springify()
        .damping(spring.list.damping)
        .stiffness(spring.list.stiffness)}
      style={styles.actionWrapper}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95, spring.press) }}
        onPressOut={() => { scale.value = withSpring(1,    spring.press) }}
        onPress={onPress}
      >
        {/* Inner view: press-spring scale transform. Separate from the entrance
            view so the scale resets properly after the entrance animation ends. */}
        <Animated.View style={[styles.actionCard, pressStyle]}>
          <View style={[styles.actionIcon, { backgroundColor: bg }]}>
            <HugeiconsIcon icon={icon} size={22} color={color} strokeWidth={1.5} />
          </View>
          <Text style={[styles.actionLabel, { fontSize: rf(13) }]}>{label}</Text>
          <Text style={[styles.actionSub,   { fontSize: rf(11) }]}>{subtitle}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Returns a time-of-day greeting key based on the current local hour.
 *
 * The returned string is used to look up a localised greeting in i18n:
 *   `home.greeting_morning`   → "Good morning"
 *   `home.greeting_afternoon` → "Good afternoon"
 *   `home.greeting_evening`   → "Good evening"
 *
 * Boundaries follow common convention: morning < 12:00, afternoon < 17:00, evening ≥ 17:00.
 *
 * @returns `'morning'` | `'afternoon'` | `'evening'`
 */
function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: {},

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft:    { flex: 1, marginRight: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: {
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  bizName: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },

  /** Icon button shell for Cart and Notifications header actions. */
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  notifBtnTablet: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  /** Red badge overlaid on the icon buttons; capped at "9+" via JS. */
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },

  // ── Trial banner ──────────────────────────────────────────────────────────
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trialText: { flex: 1, fontFamily: 'Poppins-Regular', color: '#92400E' },
  trialLink: { fontFamily: 'Poppins-Bold', color: '#D97706', textDecorationLine: 'underline' },

  // ── Shared section header ─────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 12,
  },

  // ── Quick Actions grid ────────────────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  /** 47.5% width creates two columns; the remaining ~5% is distributed as gap. */
  actionWrapper: { width: '47.5%' },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    gap: 8,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: 'Poppins-SemiBold', color: '#111827' },
  actionSub:   { fontFamily: 'Poppins-Regular',  color: '#9CA3AF' },

  // ── Status guide ──────────────────────────────────────────────────────────
  statusGuide: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusText:  { flex: 1, gap: 2 },
  statusLabel: { fontFamily: 'Poppins-SemiBold', color: '#111827' },
  statusDesc:  { fontFamily: 'Poppins-Regular',  color: '#6B7280' },

  // ── Tablet two-column layout ──────────────────────────────────────────────
  twoColRow:   { flexDirection: 'row', gap: 20 },
  twoColLeft:  { flex: 3 },
  twoColRight: { flex: 2 },

  // ── Recent Orders section ─────────────────────────────────────────────────
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  recentViewAll: {
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  /** Bottom border separates rows; omitted on the last row to avoid a double border with the card. */
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
  },
  recentLeft:     { flex: 1, gap: 2 },
  recentRight:    { alignItems: 'flex-end', gap: 4 },
  recentId:       { fontFamily: 'Poppins-Bold',    color: '#111827' },
  recentSupplier: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  recentDate:     { fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  recentAmount:   { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },

  /** Shared skeleton shimmer block used for loading placeholders within rows. */
  skeletonLine: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
})
