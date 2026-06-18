import { create } from 'zustand'
import type { CartItem } from '@/types'
import * as CartApi from '@/api/cart'

interface CartState {
  items: CartItem[]
  isLoading: boolean

  itemCount: () => number
  getItemCount: () => number
  grandTotal: () => number

  fetchCart: () => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearLocalCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  grandTotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),

  async fetchCart() {
    set({ isLoading: true })
    try {
      const items = await CartApi.getCart()
      set({ items })
    } finally {
      set({ isLoading: false })
    }
  },

  async removeItem(itemId) {
    await CartApi.removeCartItem(itemId)
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }))
  },

  async updateQuantity(itemId, quantity) {
    const updated = await CartApi.updateCartItem(itemId, { quantity })
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? updated : i)),
    }))
  },

  clearLocalCart() {
    set({ items: [] })
  },
}))
