import { apiClient } from './client'
import type { Notification } from '@/types'
import { DEMO_MODE } from '@/config/demo'
import { mockGetNotifications, mockMarkNotificationsRead } from './mock'

export async function getNotifications(): Promise<Notification[]> {
  if (DEMO_MODE) return mockGetNotifications()
  const res = await apiClient.get<{ success: true; data: Notification[] }>('/notifications')
  return res.data.data
}

export async function markNotificationsRead(ids: number[]): Promise<void> {
  if (DEMO_MODE) return mockMarkNotificationsRead(ids)
  await apiClient.post('/notifications/mark-read', { ids })
}
