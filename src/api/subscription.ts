import { apiClient } from './client'
import type { SubscriptionStatus, SubscriptionPlan } from '@/types'
import { DEMO_MODE } from '@/config/demo'
import { mockGetSubscriptionStatus, mockGetSubscriptionPrices } from './mock'

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (DEMO_MODE) return mockGetSubscriptionStatus()
  const res = await apiClient.get<{ success: true; data: SubscriptionStatus }>('/subscription/status')
  return res.data.data
}

export async function getSubscriptionPrices(): Promise<SubscriptionPlan[]> {
  if (DEMO_MODE) return mockGetSubscriptionPrices()
  const res = await apiClient.get<{ success: true; data: SubscriptionPlan[] }>('/subscription/prices')
  return res.data.data
}
