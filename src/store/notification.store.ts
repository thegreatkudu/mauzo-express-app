import { create } from 'zustand'
import type { Notification } from '@/types'
import * as NotifApi from '@/api/notifications'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  fetchNotifications: () => Promise<void>
  markRead: (ids: number[]) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  async fetchNotifications() {
    const notifications = await NotifApi.getNotifications()
    const unreadCount = notifications.filter((n) => !n.is_read).length
    set({ notifications, unreadCount })
  },

  async markRead(ids) {
    await NotifApi.markNotificationsRead(ids)
    set((s) => ({
      notifications: s.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, is_read: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - ids.length),
    }))
  },
}))
