import { useEffect } from 'react'
import {
  ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useMarkNotificationsRead } from '@/hooks/useNotifications'
import { BackIcon, ChevronRightIcon, OrdersIcon, CrownIcon } from '@/constants/icons'
import { formatDateTime } from '@/utils/date'
import { getNotifMeta } from '@/utils/notifications'
import type { NotificationType } from '@/types'

type Params = {
  id:           string
  message:      string
  type:         string
  is_read:      string
  created_at:   string
  reference_id: string
}

export default function NotificationPreviewScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<Params>()
  const markRead = useMarkNotificationsRead()

  const notifType = params.type as NotificationType
  const meta      = getNotifMeta(notifType, params.message ?? '')
  const wasUnread = params.is_read === 'false'
  const hasOrder  = !!params.reference_id && notifType !== 'subscription'
  const hasSub    = notifType === 'subscription'

  // Mark as read on mount if it was unread
  useEffect(() => {
    if (wasUnread && params.id) {
      markRead.mutate([Number(params.id)])
    }
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={22} color='#374151' strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notification_preview.header_title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          {/* Large icon circle */}
          <View style={[styles.heroIconOuter, { backgroundColor: meta.bgColor + '60' }]}>
            <View style={[styles.heroIconInner, { backgroundColor: meta.bgColor }]}>
              <HugeiconsIcon icon={meta.icon as any} size={38} color={meta.color} strokeWidth={1.5} />
            </View>
          </View>

          {/* "New" badge if it was unread */}
          {wasUnread && (
            <View style={[styles.newBadge, { backgroundColor: meta.color }]}>
              <Text style={styles.newBadgeText}>{t('notification_preview.badge_new')}</Text>
            </View>
          )}

          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: meta.bgColor }]}>
            <Text style={[styles.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Title */}
          <Text style={styles.heroTitle}>{meta.title}</Text>

          {/* Datetime */}
          <Text style={styles.heroTime}>
            {params.created_at ? formatDateTime(params.created_at) : ''}
          </Text>
        </View>

        {/* ── Message card ── */}
        <View style={styles.messageCard}>
          <Text style={styles.messageCardLabel}>{t('notification_preview.message_label')}</Text>
          <Text style={styles.messageText}>{params.message}</Text>
        </View>

        {/* ── Details row: read status ── */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('notification_preview.status_label')}</Text>
            <View style={[
              styles.statusPill,
              { backgroundColor: wasUnread ? '#FEF0E6' : '#ECFDF5' },
            ]}>
              <Text style={[
                styles.statusPillText,
                { color: wasUnread ? '#CE4002' : '#059669' },
              ]}>
                {wasUnread
                  ? t('notification_preview.status_new')
                  : t('notification_preview.status_read')}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('notification_preview.category_label')}</Text>
            <Text style={styles.detailValue}>{meta.label}</Text>
          </View>
        </View>

        {/* ── CTA buttons ── */}
        <View style={styles.actions}>
          {/* View Order */}
          {hasOrder && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push(`/order/${params.reference_id}`)}
              activeOpacity={0.85}
            >
              <HugeiconsIcon icon={OrdersIcon} size={18} color='#fff' strokeWidth={1.5} />
              <Text style={styles.primaryBtnText}>{t('notification_preview.view_order')}</Text>
              <HugeiconsIcon icon={ChevronRightIcon} size={16} color='#fff' strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* View Subscription */}
          {hasSub && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/subscription')}
              activeOpacity={0.85}
            >
              <HugeiconsIcon icon={CrownIcon} size={18} color='#fff' strokeWidth={1.5} />
              <Text style={styles.primaryBtnText}>{t('notification_preview.view_subscription')}</Text>
              <HugeiconsIcon icon={ChevronRightIcon} size={16} color='#fff' strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Back to notifications */}
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostBtnText}>{t('notification_preview.back')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F6F4' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    backgroundColor:   '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  scroll: { paddingHorizontal: 16, paddingTop: 28 },

  // Hero
  hero: { alignItems: 'center', marginBottom: 24 },

  heroIconOuter: {
    width:          104,
    height:         104,
    borderRadius:   52,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   16,
  },
  heroIconInner: {
    width:          80,
    height:         80,
    borderRadius:   40,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.08,
    shadowRadius:   12,
    elevation:      4,
  },

  newBadge: {
    position:          'absolute',
    top:               0,
    right:             '25%',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      20,
  },
  newBadgeText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: '#fff' },

  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical:   4,
    borderRadius:      20,
    marginBottom:      12,
  },
  typeBadgeText: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },

  heroTitle: {
    fontSize:    20,
    fontFamily:  'Poppins-Bold',
    color:       '#111827',
    textAlign:   'center',
    marginBottom: 6,
  },
  heroTime: {
    fontSize:   12,
    fontFamily: 'Poppins-Regular',
    color:      '#9CA3AF',
  },

  // Message card
  messageCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         18,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     '#F0F0F0',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       1,
    gap:             10,
  },
  messageCardLabel: {
    fontSize:   11,
    fontFamily: 'Poppins-SemiBold',
    color:      '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  messageText: {
    fontSize:   14,
    fontFamily: 'Poppins-Regular',
    color:      '#374151',
    lineHeight: 22,
  },

  // Details card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    paddingHorizontal: 18,
    paddingVertical:   4,
    marginBottom:    24,
    borderWidth:     1,
    borderColor:     '#F0F0F0',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       1,
  },
  detailRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  detailValue: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#374151' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius:      20,
  },
  statusPillText: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },

  // Actions
  actions: { gap: 12 },

  primaryBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    backgroundColor:   '#CE4002',
    borderRadius:      14,
    paddingVertical:   15,
    paddingHorizontal: 20,
    shadowColor:       '#CE4002',
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.25,
    shadowRadius:      8,
    elevation:         3,
  },
  primaryBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff', flex: 1, textAlign: 'center' },

  ghostBtn: {
    alignItems:        'center',
    paddingVertical:   14,
    borderRadius:      14,
    borderWidth:       1.5,
    borderColor:       '#E5E7EB',
    backgroundColor:   '#fff',
  },
  ghostBtnText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B7280' },
})
