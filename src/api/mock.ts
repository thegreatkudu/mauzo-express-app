/**
 * Stateful mock implementations of every API function.
 *
 * Called by the real API files when DEMO_MODE is true.
 * Mutations (_cart, _orders, _notifications) persist for the app session.
 */

import type {
  Supplier, Product, Brand, Unit, CartItem, Order,
  AddToCartPayload, UpdateCartPayload,
  Notification, SubscriptionStatus, SubscriptionPlan,
  Category,
} from '@/types'
import type { OrderSummary } from './orders'
import {
  MOCK_CATEGORIES,
  MOCK_SUPPLIERS,
  MOCK_SUPPLIER_PRODUCTS,
  INITIAL_CART_ITEMS,
  MOCK_ORDERS,
  MOCK_NOTIFICATIONS,
  MOCK_SUBSCRIPTION_PLANS,
} from '@/data/mockData'
import { DEMO_PROFILE } from '@/config/demo'

// ─── Simulate async latency ──────────────────────────────────────────────────
const delay = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms))

// ─── Mutable session state ────────────────────────────────────────────────────
let _cart:          CartItem[]    = INITIAL_CART_ITEMS.map(i => ({ ...i }))
let _orders:        Order[]       = MOCK_ORDERS.map(o => ({ ...o, items: [...o.items], quotations: [...o.quotations] }))
let _notifications: Notification[] = MOCK_NOTIFICATIONS.map(n => ({ ...n }))
let _nextCartId = 2000

// ─── Categories ───────────────────────────────────────────────────────────────

export async function mockGetCategories(): Promise<Category[]> {
  await delay(300)
  return [...MOCK_CATEGORIES]
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function mockGetSuppliers(): Promise<Supplier[]> {
  await delay()
  return [...MOCK_SUPPLIERS]
}

export async function mockGetSupplierProducts(supplierId: number): Promise<Product[]> {
  await delay()
  return [...(MOCK_SUPPLIER_PRODUCTS[supplierId] ?? [])]
}

export async function mockGetProductBrands(supplierId: number, productId: number): Promise<Brand[]> {
  await delay(250)
  const product = (MOCK_SUPPLIER_PRODUCTS[supplierId] ?? []).find(p => p.id === productId)
  return product ? [...product.brands] : []
}

export async function mockGetProductUnits(supplierId: number, productId: number): Promise<Unit[]> {
  await delay(250)
  const product = (MOCK_SUPPLIER_PRODUCTS[supplierId] ?? []).find(p => p.id === productId)
  return product ? [...product.units] : []
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function mockGetCart(): Promise<CartItem[]> {
  await delay()
  return _cart.map(i => ({ ...i }))
}

export async function mockAddToCart(payload: AddToCartPayload): Promise<CartItem> {
  await delay()

  const supplier = MOCK_SUPPLIERS.find(s => s.id === payload.supplier_id)
  if (!supplier) throw new Error(`Supplier ${payload.supplier_id} not found in demo data`)

  const products = MOCK_SUPPLIER_PRODUCTS[payload.supplier_id] ?? []
  const product  = products.find(p => p.id === payload.sub_category_id)
  if (!product) throw new Error(`Product ${payload.sub_category_id} not found for supplier ${payload.supplier_id}`)

  const unit  = product.units.find(u => u.id === payload.unit_id) ?? product.units[0]
  const brand = product.brands.find(b => b.id === payload.brand_id) ?? null

  // Merge with existing line if same product+unit+supplier
  const existing = _cart.find(
    i => i.product.id === product.id && i.unit.id === unit.id && i.supplier.id === supplier.id,
  )
  if (existing) {
    existing.quantity += payload.quantity
    existing.subtotal  = existing.quantity * unit.price
    return { ...existing }
  }

  const newItem: CartItem = {
    id:       _nextCartId++,
    product,
    brand,
    unit,
    quantity: payload.quantity,
    supplier,
    subtotal: payload.quantity * unit.price,
  }
  _cart.push(newItem)
  return { ...newItem }
}

export async function mockUpdateCartItem(itemId: number, payload: UpdateCartPayload): Promise<CartItem> {
  await delay(250)
  const item = _cart.find(i => i.id === itemId)
  if (!item) throw new Error(`Cart item ${itemId} not found`)
  item.quantity = payload.quantity
  item.subtotal = payload.quantity * item.unit.price
  return { ...item }
}

export async function mockRemoveCartItem(itemId: number): Promise<void> {
  await delay(250)
  _cart = _cart.filter(i => i.id !== itemId)
}

// ─── Orders ───────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = new Set(['awaiting_quote', 'quote_received', 'accepted', 'dispatched'])

export async function mockGetOrders(): Promise<Order[]> {
  await delay()
  return _orders.map(o => ({ ...o }))
}

export async function mockGetOrderSummary(): Promise<OrderSummary> {
  await delay(300)
  return {
    active_count:               _orders.filter(o => ACTIVE_STATUSES.has(o.status)).length,
    pending_quotation_count:    _orders.filter(o => o.status === 'quote_received').length,
    accepted_quotation_count:   _orders.filter(o => o.status === 'accepted' || o.status === 'dispatched').length,
  }
}

export async function mockGetOrderDetail(orderId: string): Promise<Order> {
  await delay()
  const order = _orders.find(o => o.order_id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  return { ...order, items: [...order.items], quotations: [...order.quotations] }
}

export async function mockPlaceOrder(): Promise<{ order_id: string }> {
  await delay(600)

  if (_cart.length === 0) {
    throw new Error('Cart is empty')
  }

  // Group cart items by supplier and create one order per supplier
  const bySupplier = new Map<number, CartItem[]>()
  for (const item of _cart) {
    const list = bySupplier.get(item.supplier.id) ?? []
    list.push(item)
    bySupplier.set(item.supplier.id, list)
  }

  let firstOrderId = ''
  const seq = _orders.length + 1

  Array.from(bySupplier.entries()).forEach(([, items], idx) => {
    const orderId = `ORD-2026-${String(seq + idx).padStart(4, '0')}-NEW`
    if (idx === 0) firstOrderId = orderId

    const newOrder: Order = {
      order_id:   orderId,
      created_at: new Date().toISOString(),
      supplier:   items[0].supplier,
      items:      items.map((ci, i) => ({
        id:       9000 + seq * 10 + idx * 100 + i,
        product:  ci.product,
        brand:    ci.brand,
        unit:     ci.unit,
        quantity: ci.quantity,
      })),
      quotations:          [],
      total_quoted_amount: null,
      status:              'awaiting_quote',
    }
    _orders.unshift(newOrder)
  })

  _cart = []
  return { order_id: firstOrderId }
}

export async function mockAcceptOrder(orderId: string): Promise<void> {
  await delay(400)
  const order = _orders.find(o => o.order_id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  order.status = 'accepted'
  order.quotations = order.quotations.map(q => ({ ...q, status: 'ACCEPTED' as const }))
}

export async function mockRejectOrder(orderId: string, reason: string): Promise<void> {
  await delay(400)
  const order = _orders.find(o => o.order_id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  order.status = 'rejected'
  order.quotations = order.quotations.map(q => ({
    ...q,
    rejection_reason: reason || 'Rejected by buyer',
  }))
}

export async function mockMarkDelivered(orderId: string): Promise<void> {
  await delay(400)
  const order = _orders.find(o => o.order_id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  order.status = 'delivered'
}

export async function mockReportDeliveryIssue(orderId: string, _reason: string): Promise<void> {
  await delay(400)
  const order = _orders.find(o => o.order_id === orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)
  // Status stays 'dispatched' — admin/supplier is notified to follow up.
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function mockGetNotifications(): Promise<Notification[]> {
  await delay()
  return _notifications.map(n => ({ ...n }))
}

export async function mockMarkNotificationsRead(ids: number[]): Promise<void> {
  await delay(250)
  const idSet = new Set(ids)
  _notifications = _notifications.map(n =>
    idSet.has(n.id) ? { ...n, is_read: true } : n,
  )
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function mockGetSubscriptionStatus(): Promise<SubscriptionStatus> {
  await delay(300)
  return { ...DEMO_PROFILE.subscription }
}

export async function mockGetSubscriptionPrices(): Promise<SubscriptionPlan[]> {
  await delay(300)
  return [...MOCK_SUBSCRIPTION_PLANS]
}
