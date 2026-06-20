import { useEffect } from 'react'
import {
  RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { useTranslation } from 'react-i18next'
import { HomeStatsSkeleton } from '@/components/skeletons'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useOrderSummary } from '@/hooks/useOrders'
import { useNotifications, useNotificationPolling } from '@/hooks/useNotifications'
import { useResponsive } from '@/hooks/useResponsive'
import {
  NotificationIcon,
  SuppliersNavIcon,
  OrdersIcon,
  CartIcon,
  InfoIcon,
  ClockIcon,
  CheckCircleIcon,
  ReceiptIcon,
} from '@/constants/icons'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function HomeScreen() {
  const profile  = useAuthStore(s => s.profile)
  const cartCount = useCartStore(s => s.getItemCount())
  const { fetchCart } = useCartStore()

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useOrderSummary()
  const { data: notifications } = useNotifications()

  const { hp, rf, vgap, gap, isTablet, isLandscape, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()

  useNotificationPolling()

  useEffect(() => { fetchCart() }, [])

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0
  const sub  = profile?.subscription
  const isOnTrial = sub?.type === 'trial'
  const daysLeft  = sub?.days_remaining ?? 0

  const activeOrders   = summary?.active_count                ?? 0
  const pendingQuotes  = summary?.pending_quotation_count     ?? 0
  const acceptedOrders = summary?.accepted_quotation_count    ?? 0

  function onRefresh() {
    refetchSummary()
    fetchCart()
  }

  // On tablets in landscape we can show a two-column layout for the sections
  const twoColLayout = isTablet && isLandscape

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: hp,
            paddingBottom: 32,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor='#CE4002' />
        }
      >
        <View style={contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : undefined}>

          {/* ── Header ── */}
          <View style={[styles.header, { paddingTop: vgap, paddingBottom: vgap * 0.75 }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { fontSize: rf(13) }]}>{t(`home.greeting_${getGreeting()}`)}</Text>
              <Text style={[styles.bizName, { fontSize: rf(20), maxWidth: isTablet ? 420 : 240 }]} numberOfLines={1}>
                {profile?.business_name ?? 'Welcome'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.notifBtn, isTablet && styles.notifBtnTablet]}
                onPress={() => router.push('/(tabs)/cart')}
                activeOpacity={0.8}
              >
                <HugeiconsIcon icon={CartIcon} size={isTablet ? 24 : 22} color='#374151' strokeWidth={1.5} />
                {cartCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notifBtn, isTablet && styles.notifBtnTablet]}
                onPress={() => router.push('/notifications')}
                activeOpacity={0.8}
              >
                <HugeiconsIcon icon={NotificationIcon} size={isTablet ? 24 : 22} color='#374151' strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Trial banner ── */}
          {isOnTrial && daysLeft <= 7 && (
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.trialBanner, { borderRadius: isTablet ? 16 : 14, padding: isTablet ? 16 : 14 }]}
            >
              <HugeiconsIcon icon={InfoIcon} size={18} color='#D97706' strokeWidth={2} />
              <Text style={[styles.trialText, { fontSize: rf(13) }]}>
                {t(daysLeft !== 1 ? 'home.trial_banner_plural' : 'home.trial_banner', { count: daysLeft })}
              </Text>
              <TouchableOpacity onPress={() => router.push('/subscription')} hitSlop={8}>
                <Text style={[styles.trialLink, { fontSize: rf(13) }]}>{t('home.subscribe')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {/* ── Tablet two-column layout ── */}
          {twoColLayout ? (
            <View style={styles.twoColRow}>
              {/* Left column: Stats + Quick Actions */}
              <View style={styles.twoColLeft}>
                <StatsSection
                  summaryLoading={summaryLoading}
                  activeOrders={activeOrders}
                  pendingQuotes={pendingQuotes}
                  acceptedOrders={acceptedOrders}
                  vgap={vgap}
                  rf={rf}
                  gap={gap}
                />
                <ActionsSection
                  cartCount={cartCount}
                  vgap={vgap}
                  rf={rf}
                  gap={gap}
                />
              </View>
              {/* Right column: Status guide */}
              <View style={styles.twoColRight}>
                <StatusGuideSection vgap={vgap} rf={rf} />
              </View>
            </View>
          ) : (
            <>
              <StatsSection
                summaryLoading={summaryLoading}
                activeOrders={activeOrders}
                pendingQuotes={pendingQuotes}
                acceptedOrders={acceptedOrders}
                vgap={vgap}
                rf={rf}
                gap={gap}
              />
              <ActionsSection cartCount={cartCount} vgap={vgap} rf={rf} gap={gap} />
              <StatusGuideSection vgap={vgap} rf={rf} />
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Section sub-components ────────────────────────────────────────────────────

function StatsSection({
  summaryLoading, activeOrders, pendingQuotes, acceptedOrders, vgap, rf, gap,
}: {
  summaryLoading: boolean; activeOrders: number; pendingQuotes: number; acceptedOrders: number
  vgap: number; rf: (s: number) => number; gap: number
}) {
  const { t } = useTranslation()
  return (
    <View style={{ marginTop: vgap }}>
      <Text style={[styles.sectionTitle, { fontSize: rf(16) }]}>{t('home.order_overview')}</Text>
      {summaryLoading ? (
        <HomeStatsSkeleton />
      ) : (
        <View style={[styles.statsRow, { gap }]}>
          <StatCard label={t('home.active_orders')}   value={activeOrders}   color='#CE4002' />
          <StatCard label={t('home.pending_quotes')}  value={pendingQuotes}  color='#D97706' />
          <StatCard label={t('home.accepted')}        value={acceptedOrders} color='#059669' />
        </View>
      )}
    </View>
  )
}

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
          icon={SuppliersNavIcon}
          label={t('home.action_browse_suppliers')}
          subtitle={t('home.action_browse_suppliers_sub')}
          color='#CE4002'
          bg='#FEF0E6'
          rf={rf}
          onPress={() => router.push('/(tabs)/suppliers')}
        />
        <QuickAction
          icon={OrdersIcon}
          label={t('home.action_my_orders')}
          subtitle={t('home.action_my_orders_sub')}
          color='#7C3AED'
          bg='#EDE9FE'
          rf={rf}
          onPress={() => router.push('/(tabs)/orders')}
        />
        <QuickAction
          icon={CartIcon}
          label={t('home.action_my_cart')}
          subtitle={cartCount > 0 ? t(cartCount !== 1 ? 'home.action_cart_items_other' : 'home.action_cart_items_one', { count: cartCount }) : t('home.action_cart_empty')}
          color='#2563EB'
          bg='#DBEAFE'
          rf={rf}
          onPress={() => router.push('/(tabs)/cart')}
        />
        <QuickAction
          icon={ReceiptIcon}
          label={t('home.action_quotations')}
          subtitle={t('home.action_quotations_sub')}
          color='#D97706'
          bg='#FEF3C7'
          rf={rf}
          onPress={() => router.push('/(tabs)/orders')}
        />
      </View>
    </View>
  )
}

function StatusGuideSection({ vgap, rf }: { vgap: number; rf: (s: number) => number }) {
  const { t } = useTranslation()
  const STATUS_STEPS = [
    { icon: ClockIcon,        color: '#9CA3AF', label: t('home.status_awaiting_quote'),  desc: t('home.status_awaiting_quote_desc') },
    { icon: ReceiptIcon,      color: '#D97706', label: t('home.status_quote_received'),  desc: t('home.status_quote_received_desc') },
    { icon: CheckCircleIcon,  color: '#059669', label: t('home.status_accepted'),        desc: t('home.status_accepted_desc') },
    { icon: SuppliersNavIcon, color: '#7C3AED', label: t('home.status_dispatched'),      desc: t('home.status_dispatched_desc') },
    { icon: CheckCircleIcon,  color: '#2563EB', label: t('home.status_delivered'),       desc: t('home.status_delivered_desc') },
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

function QuickAction({
  icon, label, subtitle, color, bg, rf, onPress,
}: {
  icon: any; label: string; subtitle: string
  color: string; bg: string; onPress: () => void
  rf: (s: number) => number
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <HugeiconsIcon icon={icon} size={22} color={color} strokeWidth={1.5} />
      </View>
      <Text style={[styles.actionLabel, { fontSize: rf(13) }]}>{label}</Text>
      <Text style={[styles.actionSub,   { fontSize: rf(11) }]}>{subtitle}</Text>
    </TouchableOpacity>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: {},

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
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBtnTablet: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
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

  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trialText:  { flex: 1, fontFamily: 'Poppins-Regular', color: '#92400E' },
  trialBold:  { fontFamily: 'Poppins-Bold' },
  trialLink:  { fontFamily: 'Poppins-Bold', color: '#D97706', textDecorationLine: 'underline' },

  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
  actionLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  actionSub: {
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  statusGuide: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  statusDesc: {
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },

  // Tablet landscape two-column layout
  twoColRow: {
    flexDirection: 'row',
    gap: 20,
  },
  twoColLeft:  { flex: 3 },
  twoColRight: { flex: 2 },
})
