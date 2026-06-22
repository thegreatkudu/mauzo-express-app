import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'

import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'
import { CartSkeleton, SkeletonBox } from '@/components/skeletons'
import { useCartStore } from '@/store/cart.store'
import { placeOrder } from '@/api/orders'
import { extractApiError } from '@/api/client'
import { useResponsive } from '@/hooks/useResponsive'
import EmptyState from '@/components/ui/EmptyState'
import { useAppAlert } from '@/components/ui/AppAlert/AppAlertProvider'
import { AddIcon, MinusIcon, TrashIcon, CartIcon, SuppliersNavIcon } from '@/constants/icons'
import type { CartItem, Supplier } from '@/types'

type SupplierGroup = {
  supplier: Supplier
  items: CartItem[]
  subtotal: number
}

function navigateToProduct(supplierId: number, productId: number) {
  router.push({ pathname: '/supplier/[id]', params: { id: String(supplierId), productId: String(productId) } } as any)
}

export default function CartScreen() {
  const { items, isLoading, fetchCart, removeItem, updateQuantity, clearLocalCart } = useCartStore()
  const [placingOrder, setPlacingOrder] = useState(false)
  const insets = useSafeAreaInsets()
  const { hp, rf, isTablet, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()
  const { showAlert } = useAppAlert()

  useEffect(() => { fetchCart() }, [])

  const groups = useMemo<SupplierGroup[]>(() => {
    const map = new Map<number, SupplierGroup>()
    for (const item of items) {
      const sid = item.supplier.id
      if (!map.has(sid)) map.set(sid, { supplier: item.supplier, items: [], subtotal: 0 })
      const g = map.get(sid)!
      g.items.push(item)
      g.subtotal += item.subtotal
    }
    return Array.from(map.values())
  }, [items])

  const grandTotal = useMemo(() => items.reduce((s, i) => s + i.subtotal, 0), [items])

  async function handleRemove(itemId: number) {
    try { await removeItem(itemId) }
    catch { toast.error(t('cart.remove_error')) }
  }

  async function handleUpdateQty(itemId: number, qty: number) {
    if (qty < 1) return
    try { await updateQuantity(itemId, qty) }
    catch { toast.error(t('cart.update_error')) }
  }

  function confirmPlaceOrder() {
    showAlert({
      title:       t('cart.confirm_title'),
      message:     t(groups.length !== 1 ? 'cart.confirm_message_other' : 'cart.confirm_message_one', { count: groups.length }),
      variant:     'default',
      confirmText: t('cart.place_order'),
      cancelText:  t('common.cancel'),
      onConfirm:   doPlaceOrder,
    })
  }

  async function doPlaceOrder() {
    // Snapshot cart data before it's cleared
    const supplierNames = groups.map(g => g.supplier.business_name).join('|')
    const totalAmt      = grandTotal
    const count         = items.length

    setPlacingOrder(true)
    try {
      const result = await placeOrder()
      clearLocalCart()
      router.replace({
        pathname: '/checkout/success',
        params: {
          orderId:       result.order_id,
          supplierNames,
          totalAmount:   String(totalAmt),
          itemCount:     String(count),
          createdAt:     new Date().toISOString(),
        },
      } as any)
    } catch (err) {
      toast.error(extractApiError(err).message || t('cart.remove_error'))
    } finally {
      setPlacingOrder(false)
    }
  }

  // paddingTop(16) + totalRow(~24) + gap(14) + placeBtn(54) + paddingBottom(12) = 120
  const bottomBarH = (isTablet ? 136 : 120) + insets.bottom

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: hp }]}>
          <SkeletonBox height={22} width='50%' borderRadius={8} />
          <SkeletonBox height={13} width='30%' borderRadius={5} style={{ marginTop: 6 }} />
        </View>
        <CartSkeleton />
      </SafeAreaView>
    )
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: hp }]}>
          <Text style={[styles.title, { fontSize: rf(22) }]}>{t('cart.title')}</Text>
        </View>
        <EmptyState
          icon={CartIcon as any}
          title={t('cart.empty_title')}
          subtitle={t('cart.empty_subtitle')}
          actionLabel={t('common.browse_suppliers')}
          onAction={() => router.push('/(tabs)/suppliers')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={contentMaxWidth ? { flex: 1, maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : { flex: 1 }}>

        <View style={[styles.header, { paddingHorizontal: hp }]}>
          <Text style={[styles.title, { fontSize: rf(22) }]}>{t('cart.title')}</Text>
          <Text style={[styles.subtitle, { fontSize: rf(13) }]}>{t(items.length !== 1 ? 'cart.items_other' : 'cart.items_one', { count: items.length })}</Text>
        </View>

        <FlashList
          data={groups}
          keyExtractor={g => String(g.supplier.id)}
          renderItem={({ item: group }) => (
            <SupplierSection
              group={group}
              onRemove={handleRemove}
              onUpdateQty={handleUpdateQty}
              rf={rf}
            />
          )}
          contentContainerStyle={{ ...styles.list, paddingHorizontal: hp, paddingBottom: bottomBarH + 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchCart} tintColor='#CE4002' />
          }
        />

        {/* Bottom checkout bar */}
        <View style={[
          styles.bottomBar,
          {
            paddingHorizontal: hp,
            paddingBottom: insets.bottom + (isTablet ? 14 : 12),
            paddingTop: isTablet ? 18 : 16,
          },
        ]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontSize: rf(15) }]}>{t('cart.grand_total')}</Text>
            <Text style={[styles.totalValue, { fontSize: rf(18) }]}>TZS {grandTotal.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.placeBtn, isTablet && styles.placeBtnTablet, placingOrder && styles.placeBtnDisabled]}
            onPress={confirmPlaceOrder}
            disabled={placingOrder}
            activeOpacity={0.88}
          >
            {placingOrder
              ? <ActivityIndicator color='#fff' />
              : <Text style={[styles.placeBtnText, { fontSize: rf(16) }]}>{t('cart.place_order')}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

function SupplierSection({
  group, onRemove, onUpdateQty, rf,
}: {
  group: SupplierGroup
  onRemove: (id: number) => void
  onUpdateQty: (id: number, qty: number) => void
  rf: (s: number) => number
}) {
  const { t } = useTranslation()
  return (
    <View style={styles.supplierSection}>
      <TouchableOpacity
        style={styles.supplierHeader}
        onPress={() => router.push({ pathname: '/supplier/[id]', params: { id: String(group.supplier.id) } } as any)}
        activeOpacity={0.8}
      >
        <HugeiconsIcon icon={SuppliersNavIcon} size={16} color='#CE4002' strokeWidth={1.5} />
        <Text style={[styles.supplierName, { fontSize: rf(14) }]}>{group.supplier.business_name}</Text>
      </TouchableOpacity>
      {group.items.map(item => (
        <CartItemRow
          key={item.id}
          item={item}
          onRemove={() => onRemove(item.id)}
          onUpdateQty={(qty) => onUpdateQty(item.id, qty)}
          onProductPress={() => navigateToProduct(group.supplier.id, item.product.id)}
          rf={rf}
        />
      ))}
      <View style={styles.supplierTotal}>
        <Text style={[styles.supplierTotalLabel, { fontSize: rf(13) }]}>{t('cart.subtotal')}</Text>
        <Text style={[styles.supplierTotalValue, { fontSize: rf(14) }]}>TZS {group.subtotal.toLocaleString()}</Text>
      </View>
    </View>
  )
}

function CartItemRow({ item, onRemove, onUpdateQty, onProductPress, rf }: {
  item: CartItem
  onRemove: () => void
  onUpdateQty: (qty: number) => void
  onProductPress: () => void
  rf: (s: number) => number
}) {
  return (
    <View style={styles.itemRow}>
      <TouchableOpacity style={styles.itemInfo} onPress={onProductPress} activeOpacity={0.7}>
        <Text style={[styles.itemName, { fontSize: rf(14) }]} numberOfLines={2}>{item.product.name}</Text>
        <Text style={[styles.itemMeta, { fontSize: rf(12) }]}>
          {item.brand ? `${item.brand.name} · ` : ''}{item.unit.name}
        </Text>
        <Text style={[styles.itemPrice, { fontSize: rf(13) }]}>TZS {item.subtotal.toLocaleString()}</Text>
      </TouchableOpacity>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={onRemove} style={styles.deleteBtn} hitSlop={8}>
          <HugeiconsIcon icon={TrashIcon} size={16} color='#EF4444' strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onUpdateQty(item.quantity - 1)}
            disabled={item.quantity <= 1}
            hitSlop={4}
          >
            <HugeiconsIcon
              icon={MinusIcon} size={14}
              color={item.quantity <= 1 ? '#D1D5DB' : '#374151'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={[styles.stepQty, { fontSize: rf(14) }]}>{item.quantity}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onUpdateQty(item.quantity + 1)} hitSlop={4}>
            <HugeiconsIcon icon={AddIcon} size={14} color='#374151' strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { paddingTop: 16, paddingBottom: 8 },
  title:    { fontFamily: 'Poppins-Bold',    color: '#111827' },
  subtitle: { fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 2 },

  list:     { paddingTop: 10, paddingBottom: 4 },

  supplierSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF0E6',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  supplierName: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
    gap: 12,
  },
  itemInfo:  { flex: 1, gap: 4 },
  itemName:  { fontFamily: 'Poppins-Medium',  color: '#111827' },
  itemMeta:  { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  itemPrice: { fontFamily: 'Poppins-Bold',    color: '#CE4002', marginTop: 2 },

  itemActions: { alignItems: 'flex-end', gap: 10 },
  deleteBtn: { padding: 4 },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  stepQty: {
    fontFamily: 'Poppins-SemiBold', color: '#111827',
    minWidth: 28, textAlign: 'center',
  },

  supplierTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  supplierTotalLabel: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  supplierTotalValue: { fontFamily: 'Poppins-Bold',    color: '#111827' },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  totalRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  totalValue: { fontFamily: 'Poppins-Bold',    color: '#111827' },

  placeBtn:        { backgroundColor: '#CE4002', height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  placeBtnTablet:  { height: 58, borderRadius: 16 },
  placeBtnDisabled:{ backgroundColor: '#E8A07A' },
  placeBtnText:    { fontFamily: 'Poppins-Bold', color: '#fff' },
})
