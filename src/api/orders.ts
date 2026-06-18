import { apiClient } from './client'
import type { Order } from '@/types'
import { DEMO_MODE } from '@/config/demo'
import {
  mockGetOrders,
  mockGetOrderSummary,
  mockGetOrderDetail,
  mockPlaceOrder,
  mockAcceptOrder,
  mockRejectOrder,
} from './mock'

export type OrderSummary = {
  active_count: number
  pending_quotation_count: number
  accepted_quotation_count: number
}

export async function getOrders(): Promise<Order[]> {
  if (DEMO_MODE) return mockGetOrders()
  const res = await apiClient.get<{ success: true; data: Order[] }>('/orders')
  return res.data.data
}

export async function getOrderSummary(): Promise<OrderSummary> {
  if (DEMO_MODE) return mockGetOrderSummary()
  const res = await apiClient.get<{ success: true; data: OrderSummary }>('/orders/summary')
  return res.data.data
}

export async function getOrderDetail(orderId: string): Promise<Order> {
  if (DEMO_MODE) return mockGetOrderDetail(orderId)
  const res = await apiClient.get<{ success: true; data: Order }>(`/orders/${orderId}`)
  return res.data.data
}

export async function placeOrder(): Promise<{ order_id: string }> {
  if (DEMO_MODE) return mockPlaceOrder()
  const res = await apiClient.post<{ success: true; data: { order_id: string } }>('/orders')
  return res.data.data
}

export async function acceptOrder(orderId: string): Promise<void> {
  if (DEMO_MODE) return mockAcceptOrder(orderId)
  await apiClient.post(`/orders/${orderId}/accept`)
}

export async function rejectOrder(orderId: string, reason: string): Promise<void> {
  if (DEMO_MODE) return mockRejectOrder(orderId, reason)
  await apiClient.post(`/orders/${orderId}/reject`, { reason })
}
