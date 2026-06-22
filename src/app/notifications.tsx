import { memo } from 'react'
import {
  RefreshControl, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications'
import EmptyState from '@/components/ui/EmptyState'
import { NotificationRowSkeleton } from '@/components/skeletons'
import { BackIcon, NotificationIcon, CheckCircleIcon, RefreshIcon } from '@/constants/icons'
import { timeAgo } from '@/utils/date'
import { getNotifMeta } from '@/utils/notifications'
import type { Notification } from '@/types'

// ── Card ─────────────────────────────────────────────────────────────────────

const NotificationRow = memo(function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification
  onPress: () => void
}) {
  const meta = getNotifMeta(notification.type, notification.message)
  const unread = !notification.is_read

  return (
    <TouchableOpacity
      style={[
        styles.row,
        unread && styles.rowUnread,
        unread && { borderLeftColor: meta.color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon circle */}
      <View style={[styles.iconWrap, { backgroundColor: meta.bgColor }]}>
        <HugeiconsIcon icon={meta.icon as any} size={20} color={meta.color} strokeWidth={1.5} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title + time */}
        <View style={styles.titleRow}>
          <Text style={[styles.notifTitle, unread && styles.notifTitleUnread]} numberOfLines={1}>
            {meta.title}
          </Text>
          <Text style={styles.time}>{timeAgo(notification.created_at)}</Text>
        </View>

        {/* Type badge */}
        <View style={[styles.badge, { backgroundColor: meta.bgColor }]}>
          <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>

        {/* Message preview */}
        <Text style={[styles.message, unread && styles.messageUnread]} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {/* Unread dot */}
      {unread && <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />}
    </TouchableOpacity>
  )
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const { data: notifications, isLoading, isError, refetch, isRefetching } = useNotifications()
  const markRead = useMarkNotificationsRead()

  const unreadIds = (notifications ?? []).filter(n => !n.is_read).map(n => n.id)

  function handlePress(notification: Notification) {
    if (!notification.is_read) {
      markRead.mutate([notification.id])
    }
    router.push({
      pathname: '/notification/[id]',
      params: {
        id:           notification.id,
        message:      notification.message,
        type:         notification.type,
        is_read:      String(notification.is_read),
        created_at:   notification.created_at,
        reference_id: notification.reference_id != null ? String(notification.reference_id) : '',
      },
    })
  }

  function markAllRead() {
    if (unreadIds.length > 0) markRead.mutate(unreadIds)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={22} color='#374151' strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadIds.length > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={8} activeOpacity={0.7}>
            <HugeiconsIcon icon={CheckCircleIcon} size={22} color='#CE4002' strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {/* Unread banner */}
      {unreadIds.length > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {t(
              unreadIds.length !== 1
                ? 'notifications.unread_banner_other'
                : 'notifications.unread_banner_one',
              { count: unreadIds.length },
            )}
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map(i => <NotificationRowSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('notifications.error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
            <HugeiconsIcon icon={RefreshIcon} size={16} color='#CE4002' strokeWidth={2} />
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlashList
          data={notifications ?? []}
          keyExtractor={n => String(n.id)}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => handlePress(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
          }
          ListEmptyComponent={
            <EmptyState
              icon={NotificationIcon as any}
              title={t('notifications.empty_title')}
              subtitle={t('notifications.empty_subtitle')}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  header: {
    flexDirection:      'row',
    alignItems:         'center',
    justifyContent:     'space-between',
    paddingHorizontal:  16,
    paddingVertical:    14,
    backgroundColor:    '#fff',
    borderBottomWidth:  1,
    borderBottomColor:  '#F0F0F0',
  },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  unreadBanner: {
    backgroundColor:   '#FEF0E6',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDDCC7',
  },
  unreadBannerText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#CE4002' },

  skeletonList: { padding: 16, paddingBottom: 40 },
  list:         { padding: 16, paddingBottom: 40 },

  row: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               13,
    backgroundColor:   '#fff',
    borderRadius:      16,
    padding:           16,
    marginBottom:      14,
    borderWidth:       1,
    borderLeftWidth:   3,
    borderColor:       '#F0F0F0',
    borderLeftColor:   '#F0F0F0',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.04,
    shadowRadius:      5,
    elevation:         2,
  },
  rowUnread: {
    backgroundColor: '#FFFCFB',
  },

  iconWrap: {
    width:           46,
    height:          46,
    borderRadius:    14,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },

  content: { flex: 1, gap: 5 },

  titleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            8,
  },
  notifTitle: {
    flex:        1,
    fontSize:    13,
    fontFamily:  'Poppins-SemiBold',
    color:       '#374151',
  },
  notifTitleUnread: { color: '#111827' },
  time: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF', flexShrink: 0 },

  badge: {
    alignSelf:         'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      20,
  },
  badgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },

  message:        { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280', lineHeight: 18 },
  messageUnread:  { color: '#374151' },

  unreadDot: {
    width:       8,
    height:      8,
    borderRadius: 4,
    marginTop:   4,
    flexShrink:  0,
  },

  errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       '#CE4002',
  },
  retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
})
