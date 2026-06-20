import { useEffect, useRef } from 'react'
import {
  Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useResponsive } from '@/hooks/useResponsive'
import { formatDate, formatOrderId } from '@/utils/date'
import {
  CheckCircleIcon, OrdersIcon, SuppliersNavIcon, HomeIcon,
  ChevronRightIcon, ClockIcon, BuildingIcon, PackageIcon, CalendarIcon,
} from '@/constants/icons'

export default function OrderSuccessScreen() {
  const { t } = useTranslation()
  const { orderId, supplierNames, totalAmount, itemCount, createdAt } =
    useLocalSearchParams<{
      orderId: string
      supplierNames: string
      totalAmount: string
      itemCount: string
      createdAt: string
    }>()

  const { rf, hp, isTablet } = useResponsive()

  // Entrance animations
  const circleScale = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const contentSlide = useRef(new Animated.Value(32)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 7,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
      ]),
    ]).start()
  }, [])

  const suppliers = (supplierNames ?? '').split('|').filter(Boolean)
  const total = parseFloat(totalAmount ?? '0')
  const count = parseInt(itemCount ?? '0', 10)
  const dateIso = createdAt ?? new Date().toISOString()

  const displayOrderId = formatOrderId(orderId ?? '')

  const supplierLabel = t(
    suppliers.length !== 1
      ? 'order_success.label_supplier_other'
      : 'order_success.label_supplier_one',
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: hp, paddingBottom: 40 },
        ]}
      >
        {/* ── Animated success circle ── */}
        <View style={styles.heroWrap}>
          <Animated.View style={{ transform: [{ scale: circleScale }] }}>
            <View style={[styles.heroOuter, isTablet && styles.heroOuterTablet]}>
              <View style={[styles.heroInner, isTablet && styles.heroInnerTablet]}>
                <HugeiconsIcon
                  icon={CheckCircleIcon}
                  size={isTablet ? 56 : 48}
                  color='#fff'
                  strokeWidth={2}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.heroText,
              { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
            ]}
          >
            <Text style={[styles.heroTitle, { fontSize: rf(24) }]}>
              {t('order_success.title')}
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: rf(13) }]}>
              {t('order_success.subtitle')}
            </Text>
          </Animated.View>
        </View>

        {/* ── Animated content block ── */}
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
            gap: 12,
          }}
        >
          {/* Order summary card */}
          <View style={styles.summaryCard}>
            {/* Coloured header */}
            <View style={styles.summaryHeader}>
              <View>
                <Text style={[styles.orderIdText, { fontSize: rf(16) }]}>
                  {displayOrderId}
                </Text>
                <View style={styles.statusPill}>
                  <HugeiconsIcon icon={ClockIcon} size={11} color='#9CA3AF' strokeWidth={2} />
                  <Text style={[styles.statusPillText, { fontSize: rf(11) }]}>
                    {t('order_success.status_awaiting')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detail rows */}
            <View style={styles.detailsWrap}>
              <DetailRow
                icon={CalendarIcon}
                label={t('order_success.label_date')}
                value={formatDate(dateIso)}
                rf={rf}
              />
              <DetailRow
                icon={BuildingIcon}
                label={supplierLabel}
                value={suppliers.join(', ') || '—'}
                rf={rf}
              />
              <DetailRow
                icon={PackageIcon}
                label={t('order_success.label_items')}
                value={t(count !== 1 ? 'order_success.items_other' : 'order_success.items_one', { count })}
                rf={rf}
              />
              <DetailRow
                icon={CheckCircleIcon}
                label={t('order_success.label_estimated')}
                value={`TZS ${total.toLocaleString()}`}
                valueColor='#CE4002'
                rf={rf}
                isLast
              />
            </View>
          </View>

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <HugeiconsIcon icon={ClockIcon} size={15} color='#2563EB' strokeWidth={1.5} />
            <Text style={[styles.infoBannerText, { fontSize: rf(12) }]}>
              {t('order_success.quote_info')}
            </Text>
          </View>

          {/* ── Action buttons ── */}
          <View style={styles.actionsWrap}>
            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.replace(`/order/${orderId}` as any)}
              activeOpacity={0.88}
            >
              <HugeiconsIcon icon={OrdersIcon} size={18} color='#fff' strokeWidth={2} />
              <Text style={[styles.btnPrimaryText, { fontSize: rf(15) }]}>
                {t('order_success.view_order')}
              </Text>
            </TouchableOpacity>

            {/* Secondary row */}
            <View style={styles.secondaryRow}>
              <SecondaryBtn
                label={t('order_success.view_all_orders')}
                icon={OrdersIcon}
                rf={rf}
                onPress={() => router.replace('/(tabs)/orders')}
              />
              <SecondaryBtn
                label={t('order_success.continue_shopping')}
                icon={SuppliersNavIcon}
                rf={rf}
                onPress={() => router.replace('/(tabs)/suppliers')}
              />
            </View>

            {/* Ghost / home link */}
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={HomeIcon} size={16} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={[styles.ghostBtnText, { fontSize: rf(14) }]}>
                {t('order_success.back_home')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({
  icon, label, value, valueColor, rf, isLast,
}: {
  icon: any
  label: string
  value: string
  valueColor?: string
  rf: (s: number) => number
  isLast?: boolean
}) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      <View style={styles.detailLeft}>
        <HugeiconsIcon icon={icon} size={14} color='#9CA3AF' strokeWidth={1.5} />
        <Text style={[styles.detailLabel, { fontSize: rf(12) }]}>{label}</Text>
      </View>
      <Text
        style={[
          styles.detailValue,
          { fontSize: rf(13), color: valueColor ?? '#111827' },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  )
}

function SecondaryBtn({
  label, icon, rf, onPress,
}: {
  label: string; icon: any; rf: (s: number) => number; onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.btnSecondary} onPress={onPress} activeOpacity={0.85}>
      <HugeiconsIcon icon={icon} size={15} color='#CE4002' strokeWidth={1.5} />
      <Text style={[styles.btnSecondaryText, { fontSize: rf(12) }]} numberOfLines={1}>
        {label}
      </Text>
      <HugeiconsIcon icon={ChevronRightIcon} size={14} color='#CE4002' strokeWidth={1.5} />
    </TouchableOpacity>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingTop: 36 },

  // Hero
  heroWrap: { alignItems: 'center', marginBottom: 28, gap: 20 },
  heroOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(206, 64, 2, 0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroOuterTablet: { width: 130, height: 130, borderRadius: 65 },
  heroInner: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#CE4002',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#CE4002',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  heroInnerTablet: { width: 106, height: 106, borderRadius: 53 },
  heroText:     { alignItems: 'center', gap: 8 },
  heroTitle:    { fontFamily: 'Poppins-Bold',    color: '#111827', textAlign: 'center' },
  heroSubtitle: { fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

  // Summary card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: 20,
    backgroundColor: '#FEF0E6',
  },
  orderIdText: { fontFamily: 'Poppins-Bold', color: '#CE4002' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: { fontFamily: 'Poppins-SemiBold', color: '#9CA3AF' },

  detailsWrap: { paddingHorizontal: 20, paddingBottom: 4 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 13,
    gap: 12,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  detailValue: { fontFamily: 'Poppins-SemiBold', textAlign: 'right', flex: 1 },

  // Info banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoBannerText: {
    flex: 1, fontFamily: 'Poppins-Regular', color: '#1D4ED8', lineHeight: 18,
  },

  // Actions
  actionsWrap:    { gap: 10 },
  secondaryRow:   { flexDirection: 'row', gap: 10 },

  btnPrimary: {
    backgroundColor: '#CE4002',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#CE4002',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: { fontFamily: 'Poppins-Bold', color: '#fff' },

  btnSecondary: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FEE5D8',
  },
  btnSecondaryText: { fontFamily: 'Poppins-SemiBold', color: '#CE4002', flex: 1 },

  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  ghostBtnText: { fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
})
