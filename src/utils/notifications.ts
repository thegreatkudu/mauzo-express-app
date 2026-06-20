import type { NotificationType } from '@/types'
import type { IconSvgElement } from '@/constants/icons'
import {
  PackageIcon, CheckCircleIcon, CloseIcon, DeliveryIcon,
  ReceiptIcon, CrownIcon, OrdersIcon, CreditCardIcon, GiftIcon,
  SparklesIcon, SettingsIcon,
} from '@/constants/icons'

export interface NotifMeta {
  icon: IconSvgElement
  color: string
  bgColor: string
  label: string
  title: string
}

export function getNotifMeta(type: NotificationType, message: string): NotifMeta {
  const msg = message.toLowerCase()

  if (type === 'subscription') {
    return { icon: CrownIcon as unknown as IconSvgElement, color: '#CE4002', bgColor: '#FEF0E6', label: 'Subscription', title: 'Subscription Update' }
  }

  if (type === 'quotation') {
    return { icon: ReceiptIcon as unknown as IconSvgElement, color: '#D97706', bgColor: '#FEF3C7', label: 'Quotation', title: 'Quotation Received' }
  }

  // type === 'order' — inspect message for richer subtype
  if (msg.includes('delivered')) {
    return { icon: DeliveryIcon as unknown as IconSvgElement, color: '#059669', bgColor: '#ECFDF5', label: 'Delivered', title: 'Order Delivered' }
  }
  if (msg.includes('dispatched')) {
    return { icon: DeliveryIcon as unknown as IconSvgElement, color: '#7C3AED', bgColor: '#EDE9FE', label: 'Dispatched', title: 'Order Dispatched' }
  }
  if (msg.includes('accepted')) {
    return { icon: CheckCircleIcon as unknown as IconSvgElement, color: '#059669', bgColor: '#ECFDF5', label: 'Accepted', title: 'Order Accepted' }
  }
  if (msg.includes('rejected') || msg.includes('cancelled')) {
    return { icon: CloseIcon as unknown as IconSvgElement, color: '#DC2626', bgColor: '#FEF2F2', label: 'Rejected', title: 'Order Rejected' }
  }
  if (msg.includes('quote') || msg.includes('quotation')) {
    return { icon: ReceiptIcon as unknown as IconSvgElement, color: '#D97706', bgColor: '#FEF3C7', label: 'Quotation', title: 'Quotation Ready' }
  }
  if (msg.includes('placed') || msg.includes('new order')) {
    return { icon: PackageIcon as unknown as IconSvgElement, color: '#2563EB', bgColor: '#EFF6FF', label: 'Order Placed', title: 'Order Placed' }
  }
  if (msg.includes('payment') || msg.includes('paid')) {
    return { icon: CreditCardIcon as unknown as IconSvgElement, color: '#0891B2', bgColor: '#ECFEFF', label: 'Payment', title: 'Payment Update' }
  }
  if (msg.includes('promo') || msg.includes('discount') || msg.includes('offer')) {
    return { icon: GiftIcon as unknown as IconSvgElement, color: '#DB2777', bgColor: '#FDF2F8', label: 'Promotion', title: 'Special Offer' }
  }
  if (msg.includes('update') || msg.includes('system')) {
    return { icon: SparklesIcon as unknown as IconSvgElement, color: '#7C3AED', bgColor: '#EDE9FE', label: 'System', title: 'System Update' }
  }
  if (msg.includes('maintenance')) {
    return { icon: SettingsIcon as unknown as IconSvgElement, color: '#6B7280', bgColor: '#F0F0F0', label: 'Maintenance', title: 'Maintenance Notice' }
  }

  return { icon: OrdersIcon as unknown as IconSvgElement, color: '#D97706', bgColor: '#FEF3C7', label: 'Order Update', title: 'Order Update' }
}
