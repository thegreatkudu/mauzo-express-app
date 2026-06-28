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
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import type { Notification } from '@/types'
import { shadows } from '@/theme'

// ── Card ─────────────────────────────────────────────────────────────────────

const NotificationRow = memo(function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification
  onPress: () => void
}) {
  const { theme } = useTheme()
  const meta = getNotifMeta(notification.type, notification.message)
  const unread = !notification.is_read

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection:   'row',
          alignItems:      'flex-start',
          gap:             13,
          backgroundColor: theme.colors.card,
          borderRadius:    16,
          padding:         16,
          marginBottom:    14,
          borderWidth:     1,
          borderLeftWidth: 3,
          borderColor:     theme.colors.border,
          borderLeftColor: unread ? meta.color : theme.colors.border,
          ...shadows.subtle,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, { backgroundColor: meta.bgColor }]}>
        <HugeiconsIcon icon={meta.icon as any} size={20} color={meta.color} strokeWidth={1.5} />
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Poppins-SemiBold', color: unread ? theme.colors.text : theme.colors.textSub }} numberOfLines={1}>
            {meta.title}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: theme.colors.textMuted, flexShrink: 0 }}>
            {timeAgo(notification.created_at)}
          </Text>
        </View>

        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: meta.bgColor }}>
          <Text style={{ fontSize: 10, fontFamily: 'Poppins-SemiBold', color: meta.color }}>{meta.label}</Text>
        </View>

        <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: unread ? theme.colors.textSub : theme.colors.textMuted, lineHeight: 18 }} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {unread && <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0, backgroundColor: meta.color }} />}
    </TouchableOpacity>
  )
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)
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
          <HugeiconsIcon icon={BackIcon} size={22} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadIds.length > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={8} activeOpacity={0.7}>
            <HugeiconsIcon icon={CheckCircleIcon} size={22} color={theme.colors.primary} strokeWidth={1.5} />
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
            <HugeiconsIcon icon={RefreshIcon} size={16} color={theme.colors.primary} strokeWidth={2} />
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
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
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

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: 16,
      paddingVertical:   14,
      backgroundColor:   theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: theme.colors.text },

    unreadBanner: {
      backgroundColor:   theme.colors.primaryLight,
      paddingHorizontal: 16,
      paddingVertical:   10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primaryMuted,
    },
    unreadBannerText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: theme.colors.primary },

    skeletonList: { padding: 16, paddingBottom: 40 },
    list:         { padding: 16, paddingBottom: 40 },

    errorText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    retryBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               6,
      paddingHorizontal: 20,
      paddingVertical:   10,
      borderRadius:      12,
      borderWidth:       1.5,
      borderColor:       theme.colors.primary,
    },
    retryText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },
  })
}
