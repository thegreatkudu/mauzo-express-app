import { apiClient } from './client'
import type { CartItem, AddToCartPayload, UpdateCartPayload } from '@/types'
import { DEMO_MODE } from '@/config/demo'
import { mockGetCart, mockAddToCart, mockUpdateCartItem, mockRemoveCartItem } from './mock'

export async function getCart(): Promise<CartItem[]> {
  if (DEMO_MODE) return mockGetCart()
  const res = await apiClient.get<{ success: true; data: CartItem[] }>('/cart')
  return res.data.data
}

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  if (DEMO_MODE) return mockAddToCart(payload)
  const res = await apiClient.post<{ success: true; data: CartItem }>('/cart', payload)
  return res.data.data
}

export async function updateCartItem(itemId: number, payload: UpdateCartPayload): Promise<CartItem> {
  if (DEMO_MODE) return mockUpdateCartItem(itemId, payload)
  const res = await apiClient.put<{ success: true; data: CartItem }>(`/cart/${itemId}`, payload)
  return res.data.data
}

export async function removeCartItem(itemId: number): Promise<void> {
  if (DEMO_MODE) return mockRemoveCartItem(itemId)
  await apiClient.delete(`/cart/${itemId}`)
}
