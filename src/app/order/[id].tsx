import { useState } from 'react'
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'

import { useOrderDetail, useAcceptOrder, useRejectOrder } from '@/hooks/useOrders'
import { OrderDetailSkeleton } from '@/components/skeletons'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import { useResponsive } from '@/hooks/useResponsive'
import {
  BackIcon, CheckCircleIcon, CloseIcon, ChevronRightIcon,
  CalendarIcon, BuildingIcon, PackageIcon,
  ClockIcon, DeliveryIcon, TickIcon, LocationIcon,
  CoinsIcon, RefreshIcon, AlertCircleIcon,
} from '@/constants/icons'
import type { OrderStatus, QuotationStatus } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusMeta(status: OrderStatus) {
  const map: Record<OrderStatus, { bg: string; text: string }> = {
    awaiting_quote: { bg: '#F3F4F6', text: '#6B7280' },
    quote_received: { bg: '#FEF3C7', text: '#D97706' },
    accepted:       { bg: '#D1FAE5', text: '#059669' },
    rejected:       { bg: '#FEE2E2', text: '#DC2626' },
    dispatched:     { bg: '#EDE9FE', text: '#7C3AED' },
    delivered:      { bg: '#DBEAFE', text: '#2563EB' },
    closed:         { bg: '#F3F4F6', text: '#6B7280' },
    cancelled:      { bg: '#FEE2E2', text: '#DC2626' },
  }
  return map[status] ?? { bg: '#F3F4F6', text: '#6B7280' }
}

function getQuoteStatusBadge(status: QuotationStatus) {
  switch (status) {
    case 'ACCEPTED':  return { bg: '#D1FAE5', text: '#059669', label: 'Accepted' }
    case 'SUBMITTED': return { bg: '#DBEAFE', text: '#2563EB', label: 'Submitted' }
    case 'CLOSED':    return { bg: '#FEE2E2', text: '#DC2626', label: 'Closed' }
    default:          return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' }
  }
}

function getTimelineStep(status: string): number {
  switch (status) {
    case 'awaiting_quote':  return 0
    case 'quote_received':  return 1
    case 'accepted':        return 2
    case 'dispatched':      return 3
    case 'delivered':       return 4
    default:                return 0
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const { t } = useTranslation()
  const { id: orderId } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch, isRefetching } = useOrderDetail(orderId)
  const acceptMutation = useAcceptOrder()
  const rejectMutation = useRejectOrder()
  const { hp } = useResponsive()

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason,    setRejectReason]    = useState('')

  const TIMELINE_STEPS = [
    { key: 'placed',     label: t('order_detail.timeline_placed'),     icon: ClockIcon },
    { key: 'quoted',     label: t('order_detail.timeline_quoted'),     icon: PackageIcon },
    { key: 'accepted',   label: t('order_detail.timeline_accepted'),   icon: CheckCircleIcon },
    { key: 'dispatched', label: t('order_detail.timeline_dispatched'), icon: DeliveryIcon },
    { key: 'delivered',  label: t('order_detail.timeline_delivered'),  icon: TickIcon },
  ]

  function confirmAccept() {
    Alert.alert(
      t('order_detail.confirm_accept_title'),
      t('order_detail.confirm_accept_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('order_detail.accept'),
          style: 'default',
          onPress: async () => {
            try {
              await acceptMutation.mutateAsync(orderId)
              toast.success(t('order_detail.accept_success'))
            } catch {
              toast.error(t('order_detail.accept_error'))
            }
          },
        },
      ],
    )
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error(t('order_detail.reject_reason_required')); return }
    try {
      await rejectMutation.mutateAsync({ orderId, reason: rejectReason.trim() })
      setRejectModalOpen(false)
      setRejectReason('')
      toast.success(t('order_detail.reject_success'))
    } catch {
      toast.error(t('order_detail.reject_error'))
    }
  }

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} />
        <OrderDetailSkeleton />
      </SafeAreaView>
    )
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('order_detail.error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
            <HugeiconsIcon icon={RefreshIcon} size={16} color='#CE4002' strokeWidth={2} />
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const activeStep  = getTimelineStep(order.status)
  const statusMeta  = getStatusMeta(order.status)
  const canAct      = order.status === 'quote_received'
  const isRejected  = order.status === 'rejected' || order.status === 'cancelled'
  const rejectionReason = order.quotations.find(q => q.rejection_reason)?.rejection_reason ?? null
  const itemCount   = order.items.length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={() => router.back()} onRefresh={refetch} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
        }
      >
        {/* ── 1. Order Hero ── */}
        <View style={styles.heroCard}>
          {/* Status-colored band */}
          <View style={[styles.heroBand, { backgroundColor: statusMeta.bg }]}>
            <View style={styles.heroBandLeft}>
              <Text style={[styles.heroOrderId, { color: statusMeta.text }]}>
                {formatOrderId(order.order_id)}
              </Text>
              <View style={styles.heroDateRow}>
                <HugeiconsIcon icon={CalendarIcon} size={12} color={statusMeta.text + 'AA'} strokeWidth={1.5} />
                <Text style={[styles.heroDate, { color: statusMeta.text + 'CC' }]}>
                  {formatDate(order.created_at)}
                </Text>
              </View>
            </View>
            <StatusBadge status={order.status} size='md' />
          </View>

          {/* Body */}
          <View style={styles.heroBody}>
            <View style={styles.infoRow}>
              <HugeiconsIcon icon={BuildingIcon} size={14} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={styles.infoText} numberOfLines={1}>{order.supplier.business_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <HugeiconsIcon icon={PackageIcon} size={14} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={styles.infoText}>
                {itemCount === 1
                  ? t('order_detail.items_one', { count: itemCount })
                  : t('order_detail.items_other', { count: itemCount })
                }
              </Text>
            </View>

            {order.total_quoted_amount != null && (
              <>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('order_detail.quoted_total')}</Text>
                  <View style={styles.totalValueWrap}>
                    <HugeiconsIcon icon={CoinsIcon} size={14} color='#CE4002' strokeWidth={1.5} />
                    <Text style={styles.totalValue}>
                      TZS {order.total_quoted_amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── 2. Supplier Card ── */}
        <TouchableOpacity
          style={styles.supplierCard}
          onPress={() => router.push({
            pathname: '/supplier/[id]',
            params: { id: order.supplier.id, name: order.supplier.business_name },
          } as any)}
          activeOpacity={0.85}
        >
          <View style={styles.supplierIconWrap}>
            <HugeiconsIcon icon={BuildingIcon} size={22} color='#CE4002' strokeWidth={1.5} />
          </View>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName} numberOfLines={1}>{order.supplier.business_name}</Text>
            <View style={styles.supplierMeta}>
              <HugeiconsIcon icon={LocationIcon} size={11} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={styles.supplierMetaText} numberOfLines={1}>
                {order.supplier.location} · {order.supplier.category.name}
              </Text>
            </View>
          </View>
          <HugeiconsIcon icon={ChevronRightIcon} size={16} color='#D1D5DB' strokeWidth={1.5} />
        </TouchableOpacity>

        {/* ── 3. Quotation received banner ── */}
        {canAct && (
          <View style={styles.quoteBanner}>
            <View style={styles.quoteBannerIconWrap}>
              <HugeiconsIcon icon={AlertCircleIcon} size={20} color='#D97706' strokeWidth={1.5} />
            </View>
            <View style={styles.quoteBannerText}>
              <Text style={styles.quoteBannerTitle}>{t('order_detail.quote_banner_title')}</Text>
              <Text style={styles.quoteBannerBody}>{t('order_detail.quote_banner_body')}</Text>
            </View>
          </View>
        )}

        {/* ── 4. Rejection reason card ── */}
        {isRejected && (
          <View style={styles.rejectionCard}>
            <View style={styles.rejectionHeader}>
              <HugeiconsIcon icon={CloseIcon} size={18} color='#DC2626' strokeWidth={2} />
              <Text style={styles.rejectionTitle}>{t('order_detail.rejection_section')}</Text>
            </View>
            <Text style={styles.rejectionReason}>
              {rejectionReason ?? t('order_detail.rejection_no_reason')}
            </Text>
          </View>
        )}

        {/* ── 5. Timeline ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('order_detail.timeline_title')}</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, i) => {
              const done   = i < activeStep
              const active = i === activeStep
              const pending = i > activeStep
              return (
                <View key={step.key} style={styles.timelineStep}>
                  {/* Left: dot + connector line */}
                  <View style={styles.timelineLeft}>
                    {active ? (
                      <View style={styles.timelineDotActiveOuter}>
                        <View style={styles.timelineDotActiveInner}>
                          <HugeiconsIcon icon={step.icon} size={13} color='#fff' strokeWidth={2} />
                        </View>
                      </View>
                    ) : (
                      <View style={[
                        styles.timelineDot,
                        done    && styles.timelineDotDone,
                        pending && styles.timelineDotPending,
                      ]}>
                        <HugeiconsIcon
                          icon={step.icon}
                          size={13}
                          color={done ? '#fff' : '#D1D5DB'}
                          strokeWidth={2}
                        />
                      </View>
                    )}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
                    )}
                  </View>

                  {/* Right: label */}
                  <View style={styles.timelineLabelWrap}>
                    <Text style={[
                      styles.timelineLabel,
                      done    && styles.timelineLabelDone,
                      active  && styles.timelineLabelActive,
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* ── 6. Items & Quotations ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('order_detail.items_title', { count: itemCount })}
          </Text>

          {order.items.map((item, i) => {
            const quote     = order.quotations.find(q => q.order_item_id === item.id)
            const qBadge    = quote ? getQuoteStatusBadge(quote.status) : null
            const isLast    = i === order.items.length - 1

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemRowBorder]}
                onPress={() => router.push({
                  pathname: '/product/[id]',
                  params: {
                    id:           String(item.product.id),
                    supplierId:   String(order.supplier.id),
                    supplierName: order.supplier.business_name,
                  },
                } as any)}
                activeOpacity={0.7}
              >
                {/* Product icon bubble */}
                <View style={styles.itemIconWrap}>
                  <HugeiconsIcon icon={PackageIcon} size={16} color='#CE4002' strokeWidth={1.5} />
                </View>

                {/* Product info */}
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.brand ? `${item.brand.name} · ` : ''}{item.unit.name} × {item.quantity}
                  </Text>
                </View>

                {/* Price + status */}
                <View style={styles.itemRight}>
                  {quote?.price != null ? (
                    <>
                      <Text style={styles.itemPrice}>TZS {quote.price.toLocaleString()}</Text>
                      {qBadge && (
                        <View style={[styles.qsBadge, { backgroundColor: qBadge.bg }]}>
                          <Text style={[styles.qsBadgeText, { color: qBadge.text }]}>
                            {qBadge.label}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.noPriceText}>{t('order_detail.awaiting_quote')}</Text>
                  )}
                  <HugeiconsIcon icon={ChevronRightIcon} size={13} color='#D1D5DB' strokeWidth={1.5} />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── 7. Accept / Reject actions ── */}
        {canAct && (
          <View style={styles.actionsCard}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.rejectBtn, rejectMutation.isPending && styles.btnDisabled]}
                onPress={() => setRejectModalOpen(true)}
                disabled={rejectMutation.isPending}
                activeOpacity={0.85}
              >
                <HugeiconsIcon icon={CloseIcon} size={16} color='#EF4444' strokeWidth={2} />
                <Text style={styles.rejectBtnText}>{t('order_detail.reject')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, acceptMutation.isPending && styles.btnDisabled]}
                onPress={confirmAccept}
                disabled={acceptMutation.isPending}
                activeOpacity={0.88}
              >
                {acceptMutation.isPending
                  ? <ActivityIndicator color='#fff' size='small' />
                  : <>
                      <HugeiconsIcon icon={CheckCircleIcon} size={16} color='#fff' strokeWidth={2} />
                      <Text style={styles.acceptBtnText}>{t('order_detail.accept')}</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Reject Modal ── */}
      <Modal
        visible={rejectModalOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setRejectModalOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setRejectModalOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('order_detail.reject_modal_title')}</Text>
              <TouchableOpacity onPress={() => setRejectModalOpen(false)} hitSlop={8}>
                <HugeiconsIcon icon={CloseIcon} size={20} color='#6B7280' strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSubtitle}>{t('order_detail.reject_modal_subtitle')}</Text>
            <TextInput
              style={styles.reasonInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder={t('order_detail.reject_reason_placeholder')}
              placeholderTextColor='#9CA3AF'
              multiline
              numberOfLines={4}
              textAlignVertical='top'
            />
            <TouchableOpacity
              style={[
                styles.rejectConfirmBtn,
                (rejectMutation.isPending || !rejectReason.trim()) && styles.btnDisabled,
              ]}
              onPress={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
              activeOpacity={0.88}
            >
              {rejectMutation.isPending
                ? <ActivityIndicator color='#fff' />
                : <Text style={styles.rejectConfirmBtnText}>{t('order_detail.reject_submit')}</Text>
              }
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function ScreenHeader({ onBack, onRefresh }: { onBack: () => void; onRefresh?: () => void }) {
  const { t } = useTranslation()
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={8} activeOpacity={0.7}>
        <HugeiconsIcon icon={BackIcon} size={22} color='#374151' strokeWidth={2} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('order_detail.header_title')}</Text>
      {onRefresh ? (
        <TouchableOpacity onPress={onRefresh} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={RefreshIcon} size={20} color='#374151' strokeWidth={1.5} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 22 }} />
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  scroll: { paddingVertical: 16, gap: 14, paddingBottom: 48 },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    backgroundColor:   '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  // ── Hero Card ──────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#fff',
    borderRadius:    18,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    10,
    elevation:       2,
  },
  heroBand: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical:   16,
  },
  heroBandLeft: { gap: 4, flex: 1, marginRight: 12 },
  heroOrderId: {
    fontSize:   18,
    fontFamily: 'Poppins-Bold',
  },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroDate:    { fontSize: 12, fontFamily: 'Poppins-Regular' },

  heroBody: {
    paddingHorizontal: 18,
    paddingVertical:   14,
    gap:               10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#374151', flex: 1 },
  divider:  { height: 1, backgroundColor: '#F3F4F6' },

  totalRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  totalLabel:    { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  totalValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalValue:    { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#CE4002' },

  // ── Supplier Card ──────────────────────────────────────────────────────────
  supplierCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       1,
  },
  supplierIconWrap: {
    width:           46,
    height:          46,
    borderRadius:    14,
    backgroundColor: '#FEF0E6',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  supplierInfo: { flex: 1, gap: 3 },
  supplierName: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#111827' },
  supplierMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  supplierMetaText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF', flex: 1 },

  // ── Quote banner ───────────────────────────────────────────────────────────
  quoteBanner: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             12,
    backgroundColor: '#FFFBEB',
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     '#FDE68A',
  },
  quoteBannerIconWrap: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: '#FEF3C7',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  quoteBannerText:  { flex: 1, gap: 3 },
  quoteBannerTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#92400E' },
  quoteBannerBody:  { fontSize: 12, fontFamily: 'Poppins-Regular',  color: '#78350F', lineHeight: 18 },

  // ── Rejection card ─────────────────────────────────────────────────────────
  rejectionCard: {
    backgroundColor: '#FFF5F5',
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     '#FECACA',
    gap:             8,
  },
  rejectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rejectionTitle:  { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#DC2626' },
  rejectionReason: { fontSize: 13, fontFamily: 'Poppins-Regular',  color: '#7F1D1D', lineHeight: 20 },

  // ── Card (shared) ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       2,
    gap:             14,
  },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  // ── Timeline ───────────────────────────────────────────────────────────────
  timeline: { paddingLeft: 2 },
  timelineStep: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           14,
    minHeight:     52,
  },
  timelineLeft: {
    alignItems: 'center',
    width:      28,
  },

  // Active dot: outer ring + inner filled circle
  timelineDotActiveOuter: {
    width:          34,
    height:         34,
    borderRadius:   17,
    backgroundColor: '#CE400222',
    alignItems:     'center',
    justifyContent: 'center',
    marginLeft:     -3,
  },
  timelineDotActiveInner: {
    width:          24,
    height:         24,
    borderRadius:   12,
    backgroundColor: '#CE4002',
    alignItems:     'center',
    justifyContent: 'center',
  },

  // Normal dot
  timelineDot: {
    width:          28,
    height:         28,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: '#CE4002',
  },
  timelineDotPending: {
    backgroundColor: '#F3F4F6',
    borderWidth:     2,
    borderColor:     '#E5E7EB',
  },

  timelineLine: {
    width:           2,
    flex:            1,
    backgroundColor: '#E5E7EB',
    marginVertical:  3,
  },
  timelineLineDone: { backgroundColor: '#CE4002' },

  timelineLabelWrap: { flex: 1, paddingTop: 6 },
  timelineLabel: {
    fontSize:   13,
    fontFamily: 'Poppins-Regular',
    color:      '#D1D5DB',
  },
  timelineLabelDone: {
    fontFamily: 'Poppins-Medium',
    color:      '#6B7280',
  },
  timelineLabelActive: {
    fontFamily: 'Poppins-Bold',
    color:      '#CE4002',
  },

  // ── Items ──────────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 12,
    gap:             10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: '#FEF0E6',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  itemLeft:  { flex: 1, gap: 3 },
  itemRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  itemName:  { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#111827' },
  itemMeta:  { fontSize: 11, fontFamily: 'Poppins-Regular',  color: '#9CA3AF' },
  itemPrice: { fontSize: 13, fontFamily: 'Poppins-Bold',     color: '#CE4002' },

  qsBadge: {
    paddingHorizontal: 7,
    paddingVertical:   2,
    borderRadius:      20,
  },
  qsBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  noPriceText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },

  // ── Actions ────────────────────────────────────────────────────────────────
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       2,
  },
  actionsRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, height: 50, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#EF4444',
  },
  rejectBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#EF4444' },
  acceptBtn: {
    flex: 2, height: 50, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  acceptBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  btnDisabled:   { opacity: 0.5 },

  // ── Error / Retry ──────────────────────────────────────────────────────────
  errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#CE4002',
  },
  retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#CE4002' },

  // ── Reject Modal ───────────────────────────────────────────────────────────
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  sheetTitle:    { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827' },
  sheetSubtitle: { fontSize: 13, fontFamily: 'Poppins-Regular',  color: '#6B7280', marginBottom: 14 },
  reasonInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    padding: 14, fontSize: 14, fontFamily: 'Poppins-Regular',
    color: '#111827', backgroundColor: '#F9FAFB',
    minHeight: 100, marginBottom: 20,
  },
  rejectConfirmBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
  },
  rejectConfirmBtnText: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#fff' },
})
