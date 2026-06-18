// ─── SRS §7 — Mauzo Ordering App data models ─────────────────────────────────

export type Category = {
  id: number
  name: string
}

export type Supplier = {
  id: number
  business_name: string
  location: string
  category: Category
  product_count: number
}

export type Brand = {
  id: number
  name: string
}

export type Unit = {
  id: number
  name: string
  price: number
}

export type Product = {
  id: number
  name: string
  description: string
  image_url: string | null
  base_price: number
  min_order_quantity: number
  is_available: boolean
  stock_quantity: number
  brands: Brand[]
  units: Unit[]
}

export type CartItem = {
  id: number
  product: Product
  brand: Brand | null
  unit: Unit
  quantity: number
  supplier: Supplier
  subtotal: number
}

// ── Orders & Quotations ──────────────────────────────────────────────────────

export type OrderStatus =
  | 'awaiting_quote'
  | 'quote_received'
  | 'accepted'
  | 'rejected'
  | 'dispatched'
  | 'delivered'
  | 'closed'
  | 'cancelled'

export type QuotationStatus = 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'CLOSED'

export type OrderItem = {
  id: number                 // OrderingOrders.id (individual line item)
  product: Product
  brand: Brand | null
  unit: Unit
  quantity: number
}

export type Quotation = {
  id: number
  order_item_id: number      // FK → OrderingOrders.id
  price: number
  quantity: number
  status: QuotationStatus
  delivery_status: string | null
  rejection_reason: string | null
}

// order_id is a UUID string — the group key shared by all line items + quotations from one checkout
export type Order = {
  order_id: string
  created_at: string
  supplier: Supplier
  items: OrderItem[]
  quotations: Quotation[]
  total_quoted_amount: number | null
  status: OrderStatus
}

// ── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = {
  type: 'trial' | 'paid' | 'none'
  plan: string | null
  expires_at: string | null
  days_remaining: number
  is_active: boolean
}

// ── User / Auth ──────────────────────────────────────────────────────────────

export type UserProfile = {
  id: number
  business_name: string
  phone: string
  location: string
  category: Category
  subscription: SubscriptionStatus
}

// ── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'quotation' | 'order' | 'subscription'

export type Notification = {
  id: number
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
  reference_id: number | null   // order_id or null
}

// ── Subscription plans ───────────────────────────────────────────────────────

export type SubscriptionPlan = {
  id: number
  name: string            // Monthly / Quarterly / Semi-Annual / Annual
  duration_months: number
  price: number
}

// ── API response wrappers ────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
  field_errors?: Record<string, string>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Auth payloads ────────────────────────────────────────────────────────────

export type RegisterPayload = {
  business_name: string
  phone: string             // sent as 255XXXXXXXXX
  password: string
  business_category: number // category id
  business_location: string
}

export type LoginPayload = {
  phone: string             // sent as 255XXXXXXXXX
  password: string
}

export type LoginResponse = {
  token: string
  profile: UserProfile
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
}

// ── Cart payloads ────────────────────────────────────────────────────────────

export type AddToCartPayload = {
  sub_category_id: number
  brand_id: number
  unit_id: number
  quantity: number
  supplier_id: number
}

export type UpdateCartPayload = {
  quantity: number
}
