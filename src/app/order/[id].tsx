import { useState } from 'react'
import {
  ActivityIndicator, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@expo/ui/community/bottom-sheet'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import { shadows } from '@/theme'

import { useOrderDetail, useAcceptOrder, useRejectOrder, useMarkDelivered, useReportDeliveryIssue } from '@/hooks/useOrders'
import { OrderDetailSkeleton } from '@/components/skeletons'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAppAlert } from '@/components/ui/AppAlert/AppAlertProvider'
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

function getStatusMeta(status: OrderStatus, theme: AppTheme) {
  const map: Record<OrderStatus, { bg: string; text: string }> = {
    awaiting_quote: { bg: theme.colors.skeleton,   text: theme.colors.statusAwaitingQuote },
    quote_received: { bg: theme.colors.warningBg,  text: theme.colors.statusQuoteReceived },
    accepted:       { bg: theme.colors.successBg,  text: theme.colors.statusAccepted },
    rejected:       { bg: theme.colors.dangerBg,   text: theme.colors.statusRejected },
    dispatched:     { bg: theme.colors.infoBg,     text: theme.colors.statusDispatched },
    delivered:      { bg: theme.isDark ? '#0C2340' : '#DBEAFE', text: theme.colors.statusDelivered },
    closed:         { bg: theme.colors.skeleton,   text: theme.colors.statusAwaitingQuote },
    cancelled:      { bg: theme.colors.dangerBg,   text: theme.colors.statusCancelled },
  }
  return map[status] ?? { bg: theme.colors.skeleton, text: theme.colors.textSub }
}

function getQuoteStatusBadge(status: QuotationStatus, theme: AppTheme) {
  switch (status) {
    case 'ACCEPTED':  return { bg: theme.colors.successBg, text: theme.colors.statusAccepted,      label: 'Accepted' }
    case 'SUBMITTED': return { bg: theme.isDark ? '#0C2340' : '#DBEAFE', text: theme.colors.statusDelivered, label: 'Submitted' }
    case 'CLOSED':    return { bg: theme.colors.dangerBg,  text: theme.colors.statusRejected,      label: 'Closed' }
    default:          return { bg: theme.colors.warningBg, text: theme.colors.statusQuoteReceived, label: 'Pending' }
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
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  const { id: orderId } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch, isRefetching } = useOrderDetail(orderId)
  const acceptMutation         = useAcceptOrder()
  const rejectMutation         = useRejectOrder()
  const markDeliveredMutation  = useMarkDelivered()
  const reportIssueMutation    = useReportDeliveryIssue()
  const { hp } = useResponsive()
  const { showAlert } = useAppAlert()

  const [rejectModalOpen,     setRejectModalOpen]     = useState(false)
  const [rejectReason,        setRejectReason]        = useState('')
  const [issueModalOpen,      setIssueModalOpen]      = useState(false)
  const [issueReason,         setIssueReason]         = useState('')

  const TIMELINE_STEPS = [
    { key: 'placed',     label: t('order_detail.timeline_placed'),     icon: ClockIcon },
    { key: 'quoted',     label: t('order_detail.timeline_quoted'),     icon: PackageIcon },
    { key: 'accepted',   label: t('order_detail.timeline_accepted'),   icon: CheckCircleIcon },
    { key: 'dispatched', label: t('order_detail.timeline_dispatched'), icon: DeliveryIcon },
    { key: 'delivered',  label: t('order_detail.timeline_delivered'),  icon: TickIcon },
  ]

  function confirmAccept() {
    showAlert({
      title:       t('order_detail.confirm_accept_title'),
      message:     t('order_detail.confirm_accept_message'),
      variant:     'success',
      confirmText: t('order_detail.accept'),
      cancelText:  t('common.cancel'),
      onConfirm:   async () => {
        try {
          await acceptMutation.mutateAsync(orderId)
          toast.success(t('order_detail.accept_success'))
        } catch {
          toast.error(t('order_detail.accept_error'))
        }
      },
    })
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

  function confirmDelivered() {
    showAlert({
      title:       t('order_detail.confirm_delivered_title'),
      message:     t('order_detail.confirm_delivered_message'),
      variant:     'success',
      confirmText: t('order_detail.confirm_delivered_btn'),
      cancelText:  t('common.cancel'),
      onConfirm:   async () => {
        try {
          await markDeliveredMutation.mutateAsync(orderId)
          toast.success(t('order_detail.delivered_success'))
        } catch {
          toast.error(t('order_detail.delivered_error'))
        }
      },
    })
  }

  async function handleReportIssue() {
    if (!issueReason.trim()) { toast.error(t('order_detail.issue_reason_required')); return }
    try {
      await reportIssueMutation.mutateAsync({ orderId, reason: issueReason.trim() })
      setIssueModalOpen(false)
      setIssueReason('')
      toast.success(t('order_detail.issue_success'))
    } catch {
      toast.error(t('order_detail.issue_error'))
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
            <HugeiconsIcon icon={RefreshIcon} size={16} color={theme.colors.primary} strokeWidth={2} />
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const activeStep          = getTimelineStep(order.status)
  const statusMeta          = getStatusMeta(order.status, theme)
  const canAct              = order.status === 'quote_received'
  const canConfirmDelivery  = order.status === 'dispatched'
  const isRejected          = order.status === 'rejected' || order.status === 'cancelled'
  const rejectionReason = order.quotations.find(q => q.rejection_reason)?.rejection_reason ?? null
  const itemCount   = order.items.length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={() => router.back()} onRefresh={refetch} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
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
              <HugeiconsIcon icon={BuildingIcon} size={14} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.infoText} numberOfLines={1}>{order.supplier.business_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <HugeiconsIcon icon={PackageIcon} size={14} color={theme.colors.textMuted} strokeWidth={1.5} />
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
                    <HugeiconsIcon icon={CoinsIcon} size={14} color={theme.colors.primary} strokeWidth={1.5} />
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
            <HugeiconsIcon icon={BuildingIcon} size={22} color={theme.colors.primary} strokeWidth={1.5} />
          </View>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName} numberOfLines={1}>{order.supplier.business_name}</Text>
            <View style={styles.supplierMeta}>
              <HugeiconsIcon icon={LocationIcon} size={11} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.supplierMetaText} numberOfLines={1}>
                {order.supplier.location} · {order.supplier.category.name}
              </Text>
            </View>
          </View>
          <HugeiconsIcon icon={ChevronRightIcon} size={16} color={theme.colors.textDisabled} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* ── 3. Quotation received banner ── */}
        {canAct && (
          <View style={styles.quoteBanner}>
            <View style={styles.quoteBannerIconWrap}>
              <HugeiconsIcon icon={AlertCircleIcon} size={20} color={theme.colors.statusQuoteReceived} strokeWidth={1.5} />
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
              <HugeiconsIcon icon={CloseIcon} size={18} color={theme.colors.danger} strokeWidth={2} />
              <Text style={styles.rejectionTitle}>{t('order_detail.rejection_section')}</Text>
            </View>
            <Text style={styles.rejectionReason}>
              {rejectionReason ?? t('order_detail.rejection_no_reason')}
            </Text>
          </View>
        )}

        {/* ── 5. Dispatched banner ── */}
        {canConfirmDelivery && (
          <View style={styles.dispatchBanner}>
            <View style={styles.dispatchBannerIconWrap}>
              <HugeiconsIcon icon={DeliveryIcon} size={20} color={theme.colors.statusDispatched} strokeWidth={1.5} />
            </View>
            <View style={styles.quoteBannerText}>
              <Text style={styles.dispatchBannerTitle}>{t('order_detail.dispatch_banner_title')}</Text>
              <Text style={styles.dispatchBannerBody}>{t('order_detail.dispatch_banner_body')}</Text>
            </View>
          </View>
        )}

        {/* ── 6. Timeline ── */}
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
            const qBadge    = quote ? getQuoteStatusBadge(quote.status, theme) : null
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
                  <HugeiconsIcon icon={PackageIcon} size={16} color={theme.colors.primary} strokeWidth={1.5} />
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
                  <HugeiconsIcon icon={ChevronRightIcon} size={13} color={theme.colors.textDisabled} strokeWidth={1.5} />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── 7. Accept / Reject actions (quote_received) ── */}
        {canAct && (
          <View style={styles.actionsCard}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.rejectBtn, rejectMutation.isPending && styles.btnDisabled]}
                onPress={() => setRejectModalOpen(true)}
                disabled={rejectMutation.isPending}
                activeOpacity={0.85}
              >
                <HugeiconsIcon icon={CloseIcon} size={16} color={theme.colors.danger} strokeWidth={2} />
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

        {/* ── 8. Delivery confirmation actions (dispatched) ── */}
        {canConfirmDelivery && (
          <View style={styles.actionsCard}>
            <Text style={styles.actionsNote}>{t('order_detail.delivery_actions_note')}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.rejectBtn, reportIssueMutation.isPending && styles.btnDisabled]}
                onPress={() => setIssueModalOpen(true)}
                disabled={reportIssueMutation.isPending}
                activeOpacity={0.85}
              >
                <HugeiconsIcon icon={CloseIcon} size={16} color={theme.colors.danger} strokeWidth={2} />
                <Text style={styles.rejectBtnText}>{t('order_detail.not_delivered')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveredBtn, markDeliveredMutation.isPending && styles.btnDisabled]}
                onPress={confirmDelivered}
                disabled={markDeliveredMutation.isPending}
                activeOpacity={0.88}
              >
                {markDeliveredMutation.isPending
                  ? <ActivityIndicator color='#fff' size='small' />
                  : <>
                      <HugeiconsIcon icon={TickIcon} size={16} color='#fff' strokeWidth={2} />
                      <Text style={styles.deliveredBtnText}>{t('order_detail.mark_delivered')}</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Reject Sheet ── */}
      <BottomSheet
        index={rejectModalOpen ? 0 : -1}
        enablePanDownToClose
        onClose={() => setRejectModalOpen(false)}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('order_detail.reject_modal_title')}</Text>
            <TouchableOpacity onPress={() => setRejectModalOpen(false)} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={20} color={theme.colors.textSub} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSubtitle}>{t('order_detail.reject_modal_subtitle')}</Text>
          <BottomSheetTextInput
            style={styles.reasonInput}
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder={t('order_detail.reject_reason_placeholder')}
            placeholderTextColor={theme.colors.placeholder}
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
        </BottomSheetView>
      </BottomSheet>

      {/* ── Issue Report Sheet ── */}
      <BottomSheet
        index={issueModalOpen ? 0 : -1}
        enablePanDownToClose
        onClose={() => setIssueModalOpen(false)}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('order_detail.issue_modal_title')}</Text>
            <TouchableOpacity onPress={() => setIssueModalOpen(false)} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={20} color={theme.colors.textSub} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSubtitle}>{t('order_detail.issue_modal_subtitle')}</Text>
          <BottomSheetTextInput
            style={styles.reasonInput}
            value={issueReason}
            onChangeText={setIssueReason}
            placeholder={t('order_detail.issue_reason_placeholder')}
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
          <TouchableOpacity
            style={[
              styles.issueConfirmBtn,
              (reportIssueMutation.isPending || !issueReason.trim()) && styles.btnDisabled,
            ]}
            onPress={handleReportIssue}
            disabled={reportIssueMutation.isPending || !issueReason.trim()}
            activeOpacity={0.88}
          >
            {reportIssueMutation.isPending
              ? <ActivityIndicator color='#fff' />
              : <Text style={styles.rejectConfirmBtnText}>{t('order_detail.issue_submit')}</Text>
            }
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function ScreenHeader({ onBack, onRefresh }: { onBack: () => void; onRefresh?: () => void }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={8} activeOpacity={0.7}>
        <HugeiconsIcon icon={BackIcon} size={22} color={theme.colors.text} strokeWidth={2} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('order_detail.header_title')}</Text>
      {onRefresh ? (
        <TouchableOpacity onPress={onRefresh} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={RefreshIcon} size={20} color={theme.colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 22 }} />
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    scroll: { paddingVertical: 16, gap: 14, paddingBottom: 48 },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 14,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    },
    headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },

    heroCard: {
      backgroundColor: theme.colors.card, borderRadius: 18, overflow: 'hidden',
      borderWidth: 1, borderColor: theme.colors.divider,
      ...shadows.subtle,
    },
    heroBand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16 },
    heroBandLeft: { gap: 4, flex: 1, marginRight: 12 },
    heroOrderId:  { fontSize: 18, fontFamily: 'Poppins-Bold' },
    heroDateRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heroDate:     { fontSize: 12, fontFamily: 'Poppins-Regular' },

    heroBody: { paddingHorizontal: 18, paddingVertical: 14, gap: 10 },
    infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: theme.colors.text, flex: 1 },
    divider:  { height: 1, backgroundColor: theme.colors.divider },

    totalRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel:     { fontSize: 13, fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    totalValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    totalValue:     { fontSize: 16, fontFamily: 'Poppins-Bold', color: theme.colors.primary },

    supplierCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: theme.colors.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: theme.colors.divider,
      ...shadows.subtle,
    },
    supplierIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    supplierInfo:     { flex: 1, gap: 3 },
    supplierName:     { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    supplierMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
    supplierMetaText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: theme.colors.textMuted, flex: 1 },

    quoteBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: theme.isDark ? '#2D1F00' : '#FFFBEB',
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: theme.isDark ? '#78460A' : '#FDE68A',
    },
    quoteBannerIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.warningBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    quoteBannerText:     { flex: 1, gap: 3 },
    quoteBannerTitle:    { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: theme.isDark ? '#FBB740' : '#92400E' },
    quoteBannerBody:     { fontSize: 12, fontFamily: 'Poppins-Regular',  color: theme.isDark ? '#D97706' : '#78350F', lineHeight: 18 },

    rejectionCard: {
      backgroundColor: theme.colors.dangerBg, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: theme.isDark ? '#7F1D1D' : '#FECACA', gap: 8,
    },
    rejectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rejectionTitle:  { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.danger },
    rejectionReason: { fontSize: 13, fontFamily: 'Poppins-Regular',  color: theme.isDark ? '#FCA5A5' : '#7F1D1D', lineHeight: 20 },

    card: {
      backgroundColor: theme.colors.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: theme.colors.divider,
      ...shadows.subtle, gap: 14,
    },
    cardTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },

    timeline:     { paddingLeft: 2 },
    timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, minHeight: 52 },
    timelineLeft: { alignItems: 'center', width: 28 },

    timelineDotActiveOuter: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: theme.colors.primary + '22',
      alignItems: 'center', justifyContent: 'center', marginLeft: -3,
    },
    timelineDotActiveInner: {
      width: 24, height: 24, borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },

    timelineDot:        { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    timelineDotDone:    { backgroundColor: theme.colors.primary },
    timelineDotPending: { backgroundColor: theme.colors.skeleton, borderWidth: 2, borderColor: theme.colors.border },

    timelineLine:     { width: 2, flex: 1, backgroundColor: theme.colors.border, marginVertical: 3 },
    timelineLineDone: { backgroundColor: theme.colors.primary },

    timelineLabelWrap:   { flex: 1, paddingTop: 6 },
    timelineLabel:       { fontSize: 13, fontFamily: 'Poppins-Regular', color: theme.colors.textDisabled },
    timelineLabelDone:   { fontFamily: 'Poppins-Medium', color: theme.colors.textSub },
    timelineLabelActive: { fontFamily: 'Poppins-Bold',   color: theme.colors.primary },

    itemRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
    itemRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    itemIconWrap:  { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    itemLeft:      { flex: 1, gap: 3 },
    itemRight:     { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
    itemName:      { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    itemMeta:      { fontSize: 11, fontFamily: 'Poppins-Regular',  color: theme.colors.textMuted },
    itemPrice:     { fontSize: 13, fontFamily: 'Poppins-Bold',     color: theme.colors.primary },

    qsBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    qsBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
    noPriceText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: theme.colors.textMuted },

    dispatchBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: theme.isDark ? '#1A1040' : '#F5F3FF',
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: theme.isDark ? '#3730A3' : '#DDD6FE',
    },
    dispatchBannerIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.infoBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    dispatchBannerTitle:    { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: theme.isDark ? '#A78BFA' : '#4C1D95' },
    dispatchBannerBody:     { fontSize: 12, fontFamily: 'Poppins-Regular',  color: theme.isDark ? '#8B5CF6' : '#5B21B6', lineHeight: 18 },

    actionsCard: {
      backgroundColor: theme.colors.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: theme.colors.divider,
      ...shadows.subtle,
    },
    actionsNote: { fontSize: 12, fontFamily: 'Poppins-Regular', color: theme.colors.textSub, marginBottom: 4 },
    actionsRow:  { flexDirection: 'row', gap: 10 },
    rejectBtn: {
      flex: 1, height: 50, borderRadius: 14,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderWidth: 1.5, borderColor: theme.colors.danger,
    },
    rejectBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.danger },
    acceptBtn: {
      flex: 2, height: 50, borderRadius: 14,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      backgroundColor: theme.colors.success,
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
    },
    acceptBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },
    deliveredBtn: {
      flex: 2, height: 50, borderRadius: 14,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      backgroundColor: theme.colors.statusDelivered,
      shadowColor: theme.colors.statusDelivered,
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
    },
    deliveredBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },
    issueConfirmBtn: { height: 52, borderRadius: 14, backgroundColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center' },
    btnDisabled:     { opacity: 0.5 },

    errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    retryBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.primary },
    retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },

    sheetContent: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    sheetTitle:    { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    sheetSubtitle: { fontSize: 13, fontFamily: 'Poppins-Regular',  color: theme.colors.textSub, marginBottom: 14 },
    reasonInput: {
      borderWidth: 1.5, borderColor: theme.colors.inputBorder, borderRadius: 14,
      padding: 14, fontSize: 14, fontFamily: 'Poppins-Regular',
      color: theme.colors.text, backgroundColor: theme.colors.inputBg,
      minHeight: 100, marginBottom: 20,
    },
    rejectConfirmBtn:     { height: 52, borderRadius: 14, backgroundColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center' },
    rejectConfirmBtnText: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#fff' },
  })
}
