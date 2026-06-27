// TODO: Replace with Flask API once backend integration begins.

import { useMemo, useState } from 'react'
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'

import { useCartStore } from '@/store/cart.store'
import { placeOrder } from '@/api/orders'
import { extractApiError } from '@/api/client'
import { useResponsive } from '@/hooks/useResponsive'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import EmptyState from '@/components/ui/EmptyState'
import { useAppAlert } from '@/components/ui/AppAlert/AppAlertProvider'
import {
  BackIcon, CartIcon, BuildingIcon, PackageIcon, CheckCircleIcon, AlertCircleIcon,
} from '@/constants/icons'
import type { AppTheme } from '@/hooks/use-theme'
import type { CartItem, Supplier } from '@/types'

type SupplierGroup = {
  supplier: Supplier
  items: CartItem[]
  estimatedSubtotal: number
}

export default function OrderReviewScreen() {
  const { t } = useTranslation()
  const { items, isLoading, fetchCart, clearLocalCart } = useCartStore()
  const [placingOrder, setPlacingOrder] = useState(false)
  const [notes, setNotes] = useState('')
  const { rf, hp, isTablet } = useResponsive()
  const insets = useSafeAreaInsets()
  const { showAlert } = useAppAlert()
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)

  const groups = useMemo<SupplierGroup[]>(() => {
    const map = new Map<number, SupplierGroup>()
    for (const item of items) {
      const sid = item.supplier.id
      if (!map.has(sid)) {
        map.set(sid, { supplier: item.supplier, items: [], estimatedSubtotal: 0 })
      }
      const g = map.get(sid)!
      g.items.push(item)
      g.estimatedSubtotal += item.subtotal
    }
    return Array.from(map.values())
  }, [items])

  const estimatedTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  )

  function confirmSubmit() {
    showAlert({
      title:       t('order_review.confirm_title'),
      message:     t(
        groups.length !== 1 ? 'order_review.confirm_message_other' : 'order_review.confirm_message_one',
        { count: groups.length },
      ),
      variant:     'default',
      confirmText: t('order_review.place_order'),
      cancelText:  t('common.cancel'),
      onConfirm:   doPlaceOrder,
    })
  }

  async function doPlaceOrder() {
    setPlacingOrder(true)
    try {
      const result = await placeOrder()
      clearLocalCart()
      router.replace({
        pathname: '/checkout/success',
        params: {
          orderId:       result.order_id,
          supplierNames: groups.map(g => g.supplier.business_name).join('|'),
          totalAmount:   String(estimatedTotal),
          itemCount:     String(items.length),
          createdAt:     new Date().toISOString(),
        },
      })
    } catch (err) {
      toast.error(extractApiError(err).message || t('common.error_generic'))
    } finally {
      setPlacingOrder(false)
    }
  }

  const bottomBarH = (isTablet ? 80 : 68) + insets.bottom

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size='large' />
        </View>
      </SafeAreaView>
    )
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <EmptyState
          icon={CartIcon as any}
          title={t('order_review.empty_title')}
          subtitle={t('order_review.empty_subtitle')}
          actionLabel={t('common.browse_suppliers')}
          onAction={() => router.replace('/(tabs)/suppliers')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: hp, paddingBottom: bottomBarH + 16 },
        ]}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchCart} tintColor={theme.colors.primary} />
        }
      >
        {/* ── Quote-flow info banner ── */}
        <View style={styles.infoBanner}>
          <HugeiconsIcon icon={AlertCircleIcon} size={18} color={theme.colors.info} strokeWidth={1.5} />
          <Text style={[styles.infoBannerText, { fontSize: rf(13) }]}>
            {t('order_review.quote_info')}
          </Text>
        </View>

        {/* ── One card per supplier ── */}
        {groups.map(group => (
          <View key={group.supplier.id} style={styles.card}>
            <View style={styles.supplierHeader}>
              <View style={styles.supplierIconWrap}>
                <HugeiconsIcon icon={BuildingIcon} size={14} color={theme.colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.supplierName, { fontSize: rf(14) }]} numberOfLines={1}>
                {group.supplier.business_name}
              </Text>
            </View>

            {group.items.map((item, i) => (
              <View key={item.id} style={[styles.itemRow, i > 0 && styles.itemRowBorder]}>
                <View style={styles.itemIconWrap}>
                  <HugeiconsIcon icon={PackageIcon} size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { fontSize: rf(14) }]} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.itemMeta, { fontSize: rf(12) }]}>
                    {item.brand ? `${item.brand.name} · ` : ''}
                    {item.unit.name} × {item.quantity}
                  </Text>
                </View>
                <Text style={[styles.itemSubtotal, { fontSize: rf(13) }]}>
                  TZS {item.subtotal.toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.groupTotalRow}>
              <Text style={[styles.groupTotalLabel, { fontSize: rf(13) }]}>
                {t('cart.subtotal')}
              </Text>
              <Text style={[styles.groupTotalValue, { fontSize: rf(14) }]}>
                TZS {group.estimatedSubtotal.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}

        {/* ── Estimated total ── */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontSize: rf(16) }]}>
              {t('order_review.estimated_total')}
            </Text>
            <Text style={[styles.totalValue, { fontSize: rf(20) }]}>
              TZS {estimatedTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalNoteRow}>
            <HugeiconsIcon icon={CheckCircleIcon} size={13} color={theme.colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.totalNote, { fontSize: rf(12) }]}>
              {t('order_review.total_note')}
            </Text>
          </View>
        </View>

        {/* ── Optional notes ── */}
        <View style={styles.notesCard}>
          <Text style={[styles.notesLabel, { fontSize: rf(14) }]}>
            {t('order_review.notes_label')}
          </Text>
          <TextInput
            style={[styles.notesInput, { fontSize: rf(14) }]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('order_review.notes_placeholder')}
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={3}
            textAlignVertical='top'
          />
        </View>
      </ScrollView>

      {/* ── Submit bar ── */}
      <View style={[
        styles.bottomBar,
        {
          paddingHorizontal: hp,
          paddingBottom: insets.bottom + (isTablet ? 16 : 12),
          paddingTop: isTablet ? 14 : 12,
        },
      ]}>
        <TouchableOpacity
          style={[
            styles.placeBtn,
            isTablet && styles.placeBtnTablet,
            placingOrder && styles.placeBtnDisabled,
          ]}
          onPress={confirmSubmit}
          disabled={placingOrder}
          activeOpacity={0.88}
        >
          {placingOrder ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <>
              <HugeiconsIcon icon={CheckCircleIcon} size={18} color='#fff' strokeWidth={2} />
              <Text style={[styles.placeBtnText, { fontSize: rf(16) }]}>
                {t('order_review.place_order')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function ScreenHeader({ onBack, rf, hp, isTablet }: {
  onBack: () => void
  rf: (s: number) => number
  hp: number
  isTablet: boolean
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const btnSize   = isTablet ? 46 : 40
  const btnRadius = isTablet ? 15 : 13
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: hp,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    }}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={8}
        activeOpacity={0.7}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: btnRadius,
          backgroundColor: theme.colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.10,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <HugeiconsIcon
          icon={BackIcon}
          size={isTablet ? 22 : 20}
          color={theme.colors.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text style={{
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.text,
        fontSize: rf(17),
      }} numberOfLines={1}>
        {t('order_review.header_title')}
      </Text>
      <View style={{ width: btnSize }} />
    </View>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    scroll: { paddingTop: 14, gap: 12 },

    // ── Info banner ──────────────────────────────────────────────────────────────
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.infoBg,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoBannerText: {
      flex: 1,
      fontFamily: 'Poppins-Regular',
      color: colors.info,
      lineHeight: 20,
    },

    // ── Supplier card ────────────────────────────────────────────────────────────
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
      overflow: 'hidden',
    },
    supplierHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.primaryLight,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    supplierIconWrap: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: colors.card,
      alignItems: 'center', justifyContent: 'center',
    },
    supplierName: { fontFamily: 'Poppins-SemiBold', color: colors.primary, flex: 1 },

    // ── Item rows ────────────────────────────────────────────────────────────────
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    itemRowBorder:   { borderTopWidth: 1, borderTopColor: colors.divider },
    itemIconWrap: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: colors.cardAlt,
      alignItems: 'center', justifyContent: 'center',
      marginTop: 1, flexShrink: 0,
    },
    itemInfo:     { flex: 1, gap: 3 },
    itemName:     { fontFamily: 'Poppins-Medium',  color: colors.text },
    itemMeta:     { fontFamily: 'Poppins-Regular', color: colors.textSub },
    itemSubtotal: { fontFamily: 'Poppins-Bold',    color: colors.textSub, marginTop: 3 },

    // ── Group subtotal row ───────────────────────────────────────────────────────
    groupTotalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardAlt,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    groupTotalLabel: { fontFamily: 'Poppins-Regular', color: colors.textSub },
    groupTotalValue: { fontFamily: 'Poppins-Bold',    color: colors.textSub },

    // ── Estimated total card ─────────────────────────────────────────────────────
    totalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
      gap: 12,
    },
    totalRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel:  { fontFamily: 'Poppins-SemiBold', color: colors.text },
    totalValue:  { fontFamily: 'Poppins-Bold',     color: colors.primary },
    totalDivider: { height: 1, backgroundColor: colors.divider },
    totalNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    totalNote:    { flex: 1, fontFamily: 'Poppins-Regular', color: colors.textMuted, lineHeight: 18 },

    // ── Notes card ───────────────────────────────────────────────────────────────
    notesCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 8,
    },
    notesLabel: { fontFamily: 'Poppins-SemiBold', color: colors.text },
    notesInput: {
      padding: 12,
      backgroundColor: colors.inputBg,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      minHeight: 80,
    },

    // ── Bottom action bar ─────────────────────────────────────────────────────────
    bottomBar: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 12,
    },
    placeBtn: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    placeBtnTablet:   { height: 58, borderRadius: 16 },
    placeBtnDisabled: { backgroundColor: colors.primaryMuted },
    placeBtnText:     { fontFamily: 'Poppins-Bold', color: '#fff' },
  })
}
