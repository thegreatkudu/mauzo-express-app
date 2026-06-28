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
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import { shadows } from '@/theme'

export default function OrderSuccessScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
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
                  <HugeiconsIcon icon={ClockIcon} size={11} color={theme.colors.textMuted} strokeWidth={2} />
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
                valueColor={theme.colors.primary}
                rf={rf}
                isLast
              />
            </View>
          </View>

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <HugeiconsIcon icon={ClockIcon} size={15} color={theme.colors.info} strokeWidth={1.5} />
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
              <HugeiconsIcon icon={HomeIcon} size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
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
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      <View style={styles.detailLeft}>
        <HugeiconsIcon icon={icon} size={14} color={theme.colors.textMuted} strokeWidth={1.5} />
        <Text style={[styles.detailLabel, { fontSize: rf(12) }]}>{label}</Text>
      </View>
      <Text
        style={[
          styles.detailValue,
          { fontSize: rf(13), color: valueColor ?? theme.colors.text },
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
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
  return (
    <TouchableOpacity style={styles.btnSecondary} onPress={onPress} activeOpacity={0.85}>
      <HugeiconsIcon icon={icon} size={15} color={theme.colors.primary} strokeWidth={1.5} />
      <Text style={[styles.btnSecondaryText, { fontSize: rf(12) }]} numberOfLines={1}>
        {label}
      </Text>
      <HugeiconsIcon icon={ChevronRightIcon} size={14} color={theme.colors.primary} strokeWidth={1.5} />
    </TouchableOpacity>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingTop: 36 },

    heroWrap:        { alignItems: 'center', marginBottom: 28, gap: 20 },
    heroOuter:       { width: 110, height: 110, borderRadius: 55, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    heroOuterTablet: { width: 130, height: 130, borderRadius: 65 },
    heroInner: {
      width: 88, height: 88, borderRadius: 44,
      backgroundColor: theme.colors.primary,
      alignItems: 'center', justifyContent: 'center',
      shadowColor:   theme.colors.primary,
      shadowOffset:  { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius:  18,
      elevation:     10,
    },
    heroInnerTablet: { width: 106, height: 106, borderRadius: 53 },
    heroText:     { alignItems: 'center', gap: 8 },
    heroTitle:    { fontFamily: 'Poppins-Bold',    color: theme.colors.text,    textAlign: 'center' },
    heroSubtitle: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

    summaryCard: {
      backgroundColor: theme.colors.card,
      borderRadius:    20,
      borderWidth:     1,
      borderColor:     theme.colors.border,
      ...shadows.medium,
      overflow:        'hidden',
    },
    summaryHeader:   { padding: 20, backgroundColor: theme.colors.primaryLight },
    orderIdText:     { fontFamily: 'Poppins-Bold', color: theme.colors.primary },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      marginTop: 8, alignSelf: 'flex-start',
      backgroundColor:   theme.colors.card,
      paddingHorizontal: 10, paddingVertical: 5,
      borderRadius:      20,
    },
    statusPillText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.textMuted },

    detailsWrap:      { paddingHorizontal: 20, paddingBottom: 4 },
    detailRow:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 13, gap: 12 },
    detailRowBorder:  { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    detailLeft:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailLabel:      { fontFamily: 'Poppins-Regular', color: theme.colors.textMuted },
    detailValue:      { fontFamily: 'Poppins-SemiBold', textAlign: 'right', flex: 1 },

    infoBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10,
      backgroundColor: theme.colors.infoBg,
      borderRadius:    14, padding: 14,
      borderWidth:     1, borderColor: theme.isDark ? 'rgba(96,165,250,0.2)' : '#BFDBFE',
    },
    infoBannerText: { flex: 1, fontFamily: 'Poppins-Regular', color: theme.colors.info, lineHeight: 18 },

    actionsWrap:  { gap: 10 },
    secondaryRow: { flexDirection: 'row', gap: 10 },

    btnPrimary: {
      backgroundColor: theme.colors.primary,
      height:          54,
      borderRadius:    14,
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             10,
      shadowColor:     theme.colors.primary,
      shadowOffset:    { width: 0, height: 4 },
      shadowOpacity:   0.3,
      shadowRadius:    12,
      elevation:       6,
    },
    btnPrimaryText: { fontFamily: 'Poppins-Bold', color: '#fff' },

    btnSecondary: {
      flex:              1,
      height:            48,
      flexDirection:     'row',
      alignItems:        'center',
      gap:               6,
      paddingHorizontal: 12,
      backgroundColor:   theme.colors.card,
      borderRadius:      14,
      borderWidth:       1.5,
      borderColor:       theme.colors.primaryMuted,
    },
    btnSecondaryText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary, flex: 1 },

    ghostBtn: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            6,
      paddingVertical: 14,
    },
    ghostBtnText: { fontFamily: 'Poppins-Regular', color: theme.colors.textMuted },
  })
}
