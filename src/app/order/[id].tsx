import { useState } from 'react'
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { OrderDetailSkeleton } from '@/components/skeletons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'

import { useOrderDetail, useAcceptOrder, useRejectOrder } from '@/hooks/useOrders'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatOrderId } from '@/utils/date'
import { useResponsive } from '@/hooks/useResponsive'
import {
  BackIcon, CheckCircleIcon, CloseIcon, ChevronRightIcon,
  CalendarIcon, BuildingIcon, PackageIcon,
  ClockIcon, SuppliersNavIcon, DeliveryIcon, TickIcon,
} from '@/constants/icons'

const TIMELINE_ICONS = [ClockIcon, PackageIcon, CheckCircleIcon, DeliveryIcon, TickIcon]
const TIMELINE_KEYS  = ['placed', 'quoted', 'accepted', 'dispatched', 'delivered']

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

export default function OrderDetailScreen() {
  const { t } = useTranslation()
  const { id: orderId } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch, isRefetching } = useOrderDetail(orderId)
  const acceptMutation = useAcceptOrder()
  const rejectMutation = useRejectOrder()

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
      ]
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header onBack={() => router.back()} />
        <OrderDetailSkeleton />
      </SafeAreaView>
    )
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('order_detail.error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const activeStep = getTimelineStep(order.status)
  const canActOnQuotation = order.status === 'quote_received'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
        }
      >
        {/* ── Order Info ── */}
        <View style={styles.card}>
          <View style={styles.orderTopRow}>
            <Text style={styles.orderId}>{formatOrderId(order.order_id)}</Text>
            <StatusBadge status={order.status} />
          </View>
          <View style={styles.infoRow}>
            <HugeiconsIcon icon={CalendarIcon} size={14} color='#9CA3AF' strokeWidth={1.5} />
            <Text style={styles.infoText}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <HugeiconsIcon icon={BuildingIcon} size={14} color='#9CA3AF' strokeWidth={1.5} />
            <Text style={styles.infoText}>{order.supplier.business_name}</Text>
          </View>
          {order.total_quoted_amount != null && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('order_detail.quoted_total')}</Text>
              <Text style={styles.totalValue}>TZS {order.total_quoted_amount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* ── Timeline ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('order_detail.timeline_title')}</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, i) => {
              const done   = i <= activeStep
              const active = i === activeStep
              return (
                <View key={step.key} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      done   && styles.timelineDotDone,
                      active && styles.timelineDotActive,
                    ]}>
                      <HugeiconsIcon
                        icon={step.icon}
                        size={12}
                        color={done ? '#fff' : '#D1D5DB'}
                        strokeWidth={2}
                      />
                    </View>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <View style={[styles.timelineLine, done && i < activeStep && styles.timelineLineDone]} />
                    )}
                  </View>
                  <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
                    {step.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* ── Items & Quotations ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('order_detail.items_title', { count: order.items.length })}
          </Text>
          {order.items.map((item, i) => {
            const quote = order.quotations.find(q => q.order_item_id === item.id)
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, i < order.items.length - 1 && styles.itemRowBorder]}
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
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.brand ? `${item.brand.name} · ` : ''}{item.unit.name} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  {quote?.price != null ? (
                    <>
                      <Text style={styles.itemPrice}>TZS {quote.price.toLocaleString()}</Text>
                      <Text style={[styles.quoteStatus, { color: getQuoteStatusColor(quote.status) }]}>
                        {quote.status}
                      </Text>
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

        {/* ── Accept / Reject actions ── */}
        {canActOnQuotation && (
          <View style={styles.actionsCard}>
            <Text style={styles.actionsNote}>{t('order_detail.actions_note')}</Text>
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

      {/* Reject Modal */}
      <Modal visible={rejectModalOpen} transparent animationType='slide' onRequestClose={() => setRejectModalOpen(false)}>
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
              style={[styles.rejectConfirmBtn, (rejectMutation.isPending || !rejectReason.trim()) && styles.btnDisabled]}
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

function Header({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const { rf, hp, isTablet } = useResponsive()
  const btnSize   = isTablet ? 46 : 40
  const btnRadius = isTablet ? 15 : 13
  return (
    <View style={[styles.header, { paddingHorizontal: hp }]}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={8}
        activeOpacity={0.7}
        style={[styles.backBtn, { width: btnSize, height: btnSize, borderRadius: btnRadius }]}
      >
        <HugeiconsIcon
          icon={BackIcon}
          size={isTablet ? 22 : 20}
          color='#111827'
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { fontSize: rf(17) }]} numberOfLines={1}>
        {t('order_detail.header_title')}
      </Text>
      <View style={{ width: btnSize }} />
    </View>
  )
}

function getQuoteStatusColor(status: string): string {
  switch (status) {
    case 'ACCEPTED': return '#059669'
    case 'CLOSED':   return '#DC2626'
    case 'PENDING':  return '#D97706'
    default:         return '#6B7280'
  }
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111827' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280' },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  totalValue: { fontSize: 16, fontFamily: 'Poppins-Bold',    color: '#CE4002' },

  // Timeline
  timeline: { paddingLeft: 4, gap: 0 },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    minHeight: 48,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone:   { backgroundColor: '#9CA3AF', borderColor: '#9CA3AF' },
  timelineDotActive: { backgroundColor: '#CE4002', borderColor: '#CE4002' },
  timelineLine: {
    width: 2, flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  timelineLineDone: { backgroundColor: '#9CA3AF' },
  timelineLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    paddingTop: 4,
  },
  timelineLabelActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 8,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemLeft:  { flex: 1, gap: 3 },
  itemRight: { alignItems: 'flex-end', gap: 3 },
  itemName:  { fontSize: 14, fontFamily: 'Poppins-Medium',  color: '#111827' },
  itemMeta:  { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  itemPrice: { fontSize: 14, fontFamily: 'Poppins-Bold',    color: '#CE4002' },
  quoteStatus: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  noPriceText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },

  // Actions
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsNote: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280', lineHeight: 20 },
  actionsRow:  { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, height: 48, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#EF4444',
  },
  rejectBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#EF4444' },
  acceptBtn: {
    flex: 2, height: 48, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#059669',
  },
  acceptBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  btnDisabled: { opacity: 0.5 },

  errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#CE4002',
  },
  retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },

  // Reject modal
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
