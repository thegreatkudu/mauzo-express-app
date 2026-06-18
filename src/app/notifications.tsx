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
import {
  BackIcon, NotificationIcon, CheckCircleIcon,
  OrdersIcon, InfoIcon, CrownIcon,
} from '@/constants/icons'
import { timeAgo } from '@/utils/date'
import type { Notification, NotificationType } from '@/types'

const NotificationRow = memo(function NotificationRow({ notification, onPress }: {
  notification: Notification
  onPress: () => void
}) {
  const icon   = getNotifIcon(notification.type)
  const color  = getNotifColor(notification.type)

  return (
    <TouchableOpacity
      style={[styles.row, !notification.is_read && styles.rowUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <HugeiconsIcon icon={icon} size={18} color={color} strokeWidth={1.5} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowMessage, !notification.is_read && styles.rowMessageUnread]} numberOfLines={3}>
          {notification.message}
        </Text>
        <Text style={styles.rowTime}>{timeAgo(notification.created_at)}</Text>
      </View>
      {!notification.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )
})

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const { data: notifications, isLoading, isError, refetch, isRefetching } = useNotifications()
  const markRead = useMarkNotificationsRead()

  const unreadIds = (notifications ?? []).filter(n => !n.is_read).map(n => n.id)

  function handlePress(notification: Notification) {
    // Mark as read
    if (!notification.is_read) {
      markRead.mutate([notification.id])
    }
    // Navigate to order if applicable
    if (notification.reference_id && notification.type !== 'subscription') {
      router.push(`/order/${notification.reference_id}`)
    }
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
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {unreadIds.length > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={8} activeOpacity={0.7}>
            <HugeiconsIcon icon={CheckCircleIcon} size={22} color='#CE4002' strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {unreadIds.length > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {t(unreadIds.length !== 1 ? 'notifications.unread_banner_other' : 'notifications.unread_banner_one', { count: unreadIds.length })}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3, 4].map(i => <NotificationRowSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('notifications.error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
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

function getNotifIcon(type: NotificationType) {
  switch (type) {
    case 'quotation': return OrdersIcon
    case 'order':     return CheckCircleIcon
    case 'subscription': return CrownIcon
    default:          return InfoIcon
  }
}

function getNotifColor(type: NotificationType): string {
  switch (type) {
    case 'quotation': return '#D97706'
    case 'order':     return '#059669'
    case 'subscription': return '#CE4002'
    default:          return '#6366F1'
  }
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827' },

  unreadBanner: {
    backgroundColor: '#FEF0E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDDCC7',
  },
  unreadBannerText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#CE4002',
  },

  list: { padding: 16, paddingBottom: 40, gap: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowUnread: {
    borderColor: '#FEF0E6',
    backgroundColor: '#FFFCFB',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: { flex: 1, gap: 4 },
  rowMessage: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  rowMessageUnread: {
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  rowTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#CE4002',
    marginTop: 4,
    flexShrink: 0,
  },

  errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#CE4002',
  },
  retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff' },
})
