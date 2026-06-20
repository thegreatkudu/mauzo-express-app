import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator, Modal,
  Pressable, RefreshControl, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'

import { useTranslation } from 'react-i18next'
import { useSupplierProducts, useProductBrands, useProductUnits } from '@/hooks/useSuppliers'
import { addToCart } from '@/api/cart'
import { useCartStore } from '@/store/cart.store'
import { extractApiError } from '@/api/client'
import { useResponsive } from '@/hooks/useResponsive'
import { ProductCardSkeleton } from '@/components/skeletons'
import EmptyState from '@/components/ui/EmptyState'
import {
  BackIcon, PackageIcon, AddIcon, MinusIcon, CloseIcon,
  ChevronDownIcon, CheckCircleIcon, SearchIcon,
} from '@/constants/icons'
import type { Product, Brand, Unit } from '@/types'

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, supplierId, compact, onAddToCart }: {
  product: Product
  supplierId: number
  compact: boolean
  onAddToCart: (product: Product) => void
}) {
  const { t } = useTranslation()
  const imgH = compact ? 120 : 150

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        compact && styles.productCardCompact,
        !product.is_available && styles.productUnavailable,
      ]}
      onPress={() => product.is_available && onAddToCart(product)}
      activeOpacity={0.85}
    >
      {/* Image with badge overlay */}
      <View>
        {product.image_url ? (
          <Image
            source={product.image_url}
            style={[styles.productImage, { height: imgH }]}
            contentFit='cover'
            cachePolicy='memory-disk'
          />
        ) : (
          <View style={[styles.productImagePlaceholder, { height: imgH }]}>
            <HugeiconsIcon
              icon={PackageIcon}
              size={compact ? 24 : 32}
              color='#D1D5DB'
              strokeWidth={1.5}
            />
          </View>
        )}

        {/* Availability badge — absolute on image */}
        <View style={[
          styles.availBadge,
          product.is_available ? styles.availBadgeIn : styles.availBadgeOut,
        ]}>
          <Text style={[
            styles.availText,
            product.is_available ? styles.availTextIn : styles.availTextOut,
          ]}>
            {product.is_available
              ? t('supplier_products.in_stock')
              : t('supplier_products.out_of_stock')}
          </Text>
        </View>
      </View>

      {/* Card body */}
      <View style={[styles.productBody, compact && styles.productBodyCompact]}>
        <Text
          style={[styles.productName, compact && styles.productNameCompact]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Description only in single-column for readability */}
        {!compact && product.description ? (
          <Text style={styles.productDesc} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}

        {/* Price row + add button */}
        <View style={styles.productFooter}>
          <View>
            <Text style={[styles.productPrice, compact && styles.productPriceCompact]}>
              TZS {product.base_price.toLocaleString()}
            </Text>
            <Text style={styles.minQty}>
              {t('supplier_products.min_qty', { count: product.min_order_quantity })}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              compact ? styles.addBtnCircle : styles.addBtn,
              !product.is_available && styles.addBtnDisabled,
            ]}
            onPress={() => product.is_available && onAddToCart(product)}
            disabled={!product.is_available}
            activeOpacity={0.85}
          >
            <HugeiconsIcon icon={AddIcon} size={16} color='#fff' strokeWidth={2.5} />
            {!compact && <Text style={styles.addBtnText}>{t('supplier_products.add')}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Add To Cart Modal ─────────────────────────────────────────────────────────

function AddToCartModal({ product, supplierId, onClose }: {
  product: Product | null
  supplierId: number
  onClose: () => void
}) {
  const { data: brands, isLoading: brandsLoading } = useProductBrands(supplierId, product?.id ?? 0)
  const { data: units,  isLoading: unitsLoading  } = useProductUnits(supplierId, product?.id ?? 0)
  const { fetchCart } = useCartStore()

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [selectedUnit,  setSelectedUnit]  = useState<Unit | null>(null)
  const [quantity, setQuantity]           = useState(product?.min_order_quantity ?? 1)
  const [adding, setAdding]               = useState(false)

  const [brandPickerOpen, setBrandPickerOpen] = useState(false)
  const [unitPickerOpen,  setUnitPickerOpen]  = useState(false)
  const { t } = useTranslation()

  const pricePreview = selectedUnit ? selectedUnit.price * quantity : 0

  async function handleAdd() {
    if (!product) return
    if (!selectedBrand) { toast.error(t('supplier_products.error_no_brand')); return }
    if (!selectedUnit)  { toast.error(t('supplier_products.error_no_unit')); return }
    if (quantity < product.min_order_quantity) {
      toast.error(t('supplier_products.error_min_qty', { count: product.min_order_quantity }))
      return
    }
    setAdding(true)
    try {
      await addToCart({
        sub_category_id: product.id,
        brand_id:        selectedBrand.id,
        unit_id:         selectedUnit.id,
        quantity,
        supplier_id:     supplierId,
      })
      await fetchCart()
      toast.success(t('supplier_products.add_success'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err).message || t('supplier_products.add_error'))
    } finally {
      setAdding(false)
    }
  }

  if (!product) return null

  const isLoading = brandsLoading || unitsLoading

  return (
    <Modal visible={!!product} transparent animationType='slide' onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={2}>{product.name}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={20} color='#6B7280' strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color='#CE4002' style={{ marginVertical: 32 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Brand picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('supplier_products.brand_label')}</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setBrandPickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerText, !selectedBrand && styles.pickerPlaceholder]}>
                    {selectedBrand?.name ?? t('supplier_products.brand_placeholder')}
                  </Text>
                  <HugeiconsIcon icon={ChevronDownIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              {/* Unit picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('supplier_products.unit_label')}</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setUnitPickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerText, !selectedUnit && styles.pickerPlaceholder]}>
                    {selectedUnit
                      ? `${selectedUnit.name} — TZS ${selectedUnit.price.toLocaleString()}`
                      : t('supplier_products.unit_placeholder')}
                  </Text>
                  <HugeiconsIcon icon={ChevronDownIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              {/* Quantity */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('supplier_products.quantity_label')}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => Math.max(product.min_order_quantity, q - 1))}
                    hitSlop={8}
                  >
                    <HugeiconsIcon icon={MinusIcon} size={18} color='#374151' strokeWidth={2} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    value={String(quantity)}
                    onChangeText={v => {
                      const n = parseInt(v, 10)
                      if (!isNaN(n) && n >= product.min_order_quantity) setQuantity(n)
                    }}
                    keyboardType='number-pad'
                    textAlign='center'
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => q + 1)}
                    hitSlop={8}
                  >
                    <HugeiconsIcon icon={AddIcon} size={18} color='#374151' strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.minQtyHint}>
                  {t('supplier_products.min_qty_hint', { count: product.min_order_quantity })}
                </Text>
              </View>

              {/* Price preview */}
              {selectedUnit && (
                <View style={styles.pricePreview}>
                  <Text style={styles.pricePreviewLabel}>{t('supplier_products.price_preview')}</Text>
                  <Text style={styles.pricePreviewValue}>
                    TZS {pricePreview.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Confirm */}
              <TouchableOpacity
                style={[styles.confirmBtn, adding && styles.confirmBtnDisabled]}
                onPress={handleAdd}
                disabled={adding}
                activeOpacity={0.88}
              >
                {adding
                  ? <ActivityIndicator color='#fff' />
                  : <>
                      <HugeiconsIcon icon={CheckCircleIcon} size={18} color='#fff' strokeWidth={2} />
                      <Text style={styles.confirmBtnText}>{t('supplier_products.add_to_cart')}</Text>
                    </>
                }
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>

      {/* Brand picker modal */}
      <Modal
        visible={brandPickerOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setBrandPickerOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setBrandPickerOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('supplier_products.select_brand_title')}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {(brands ?? []).map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.pickerOption, selectedBrand?.id === b.id && styles.pickerOptionActive]}
                  onPress={() => { setSelectedBrand(b); setBrandPickerOpen(false) }}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedBrand?.id === b.id && styles.pickerOptionTextActive,
                  ]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Unit picker modal */}
      <Modal
        visible={unitPickerOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setUnitPickerOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setUnitPickerOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('supplier_products.select_unit_title')}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {(units ?? []).map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.pickerOption, selectedUnit?.id === u.id && styles.pickerOptionActive]}
                  onPress={() => { setSelectedUnit(u); setUnitPickerOpen(false) }}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedUnit?.id === u.id && styles.pickerOptionTextActive,
                  ]}>
                    {u.name}
                  </Text>
                  <Text style={styles.unitPrice}>TZS {u.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SupplierProductsScreen() {
  const { t } = useTranslation()
  const { id, name, productId } = useLocalSearchParams<{ id: string; name?: string; productId?: string }>()
  const supplierId = Number(id)
  const supplierName = name ?? `Supplier #${supplierId}`

  const [addToCartProduct, setAddToCartProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  const { productsColumns, hp, gap, rf } = useResponsive()
  const isMultiCol = productsColumns > 1

  const {
    data: products,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSupplierProducts(supplierId)

  // Auto-open add-to-cart modal when navigating here from the cart
  useEffect(() => {
    if (!productId || !products) return
    const target = products.find(p => p.id === Number(productId))
    if (target && target.is_available) setAddToCartProduct(target)
  }, [productId, products])

  const filtered = useMemo(() => {
    if (!products) return []
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => p.name.toLowerCase().includes(q))
  }, [products, search])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Screen header ── */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={22} color='#374151' strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.screenHeaderText}>
          <Text style={[styles.screenTitle, { fontSize: rf(17) }]} numberOfLines={1}>
            {t('supplier_products.header_title')}
          </Text>
          <Text style={[styles.screenSubtitle, { fontSize: rf(12) }]} numberOfLines={1}>
            {supplierName}
          </Text>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={[styles.searchWrap, { paddingHorizontal: hp }]}>
        <View style={styles.searchBar}>
          <HugeiconsIcon icon={SearchIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { fontSize: rf(14) }]}
            placeholder={t('supplier_products.search_placeholder')}
            placeholderTextColor='#9CA3AF'
            value={search}
            onChangeText={setSearch}
            returnKeyType='search'
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={16} color='#9CA3AF' strokeWidth={1.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        /* Skeleton grid — mirrors real grid columns */
        <View style={[styles.skeletonGrid, { paddingHorizontal: hp }]}>
          {[0, 1, 2].map(row => (
            <View
              key={row}
              style={isMultiCol ? [styles.skeletonRow, { gap }] : undefined}
            >
              {Array.from({ length: isMultiCol ? productsColumns : 1 }).map((_, col) => (
                <View key={col} style={isMultiCol ? { flex: 1 } : undefined}>
                  <ProductCardSkeleton compact={isMultiCol} />
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={PackageIcon as any}
          title={t('supplier_products.error_load')}
          subtitle={t('supplier_products.error_load_subtitle')}
          actionLabel={t('common.retry')}
          onAction={() => refetch()}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={p => String(p.id)}
          numColumns={productsColumns}
          renderItem={({ item, index }) => {
            if (!isMultiCol) {
              return (
                <ProductCard
                  product={item}
                  supplierId={supplierId}
                  compact={false}
                  onAddToCart={setAddToCartProduct}
                />
              )
            }
            const isLastCol = (index + 1) % productsColumns === 0
            return (
              <View style={[styles.gridItem, !isLastCol && { paddingRight: gap }]}>
                <ProductCard
                  product={item}
                  supplierId={supplierId}
                  compact
                  onAddToCart={setAddToCartProduct}
                />
              </View>
            )
          }}
          ListHeaderComponent={
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionLabel, { fontSize: rf(15) }]}>
                {t('supplier_products.header_title')}
              </Text>
              <Text style={[styles.sectionCount, { fontSize: rf(13) }]}>
                {t(
                  filtered.length !== 1
                    ? 'supplier_card.products_other'
                    : 'supplier_card.products_one',
                  { count: filtered.length }
                )}
              </Text>
            </View>
          }
          contentContainerStyle={{ ...styles.list, paddingHorizontal: hp }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
          }
          ListEmptyComponent={
            <EmptyState
              icon={PackageIcon as any}
              title={t('supplier_products.empty_title')}
              subtitle={t('supplier_products.empty_subtitle')}
            />
          }
        />
      )}

      <AddToCartModal
        product={addToCartProduct}
        supplierId={supplierId}
        onClose={() => setAddToCartProduct(null)}
      />
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F6F4' },

  // Screen header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  screenHeaderText: { flex: 1 },
  screenTitle:    { fontFamily: 'Poppins-SemiBold', color: '#111827' },
  screenSubtitle: { fontFamily: 'Poppins-Regular',  color: '#6B7280', marginTop: 1 },

  // Search bar
  searchWrap: { paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F4F4F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    padding: 0,
  },

  // Section header row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionLabel: { fontFamily: 'Poppins-Bold',    color: '#111827' },
  sectionCount: { fontFamily: 'Poppins-Regular', color: '#6B7280' },

  // Skeleton grid
  skeletonGrid: { paddingVertical: 8, gap: 10 },
  skeletonRow:  { flexDirection: 'row' },

  // List / grid
  list:     { paddingBottom: 32, paddingTop: 12 },
  gridItem: { flex: 1, paddingBottom: 12 },

  // ── Product Card ────────────────────────────────────────────────────────────
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productCardCompact: {
    marginBottom: 0,
  },
  productUnavailable: { opacity: 0.55 },

  productImage: { width: '100%', backgroundColor: '#F4F4F4' },
  productImagePlaceholder: {
    width: '100%',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Availability badge — absolutely positioned on image
  availBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  availBadgeIn:  { backgroundColor: 'rgba(209,250,229,0.95)' },
  availBadgeOut: { backgroundColor: 'rgba(254,226,226,0.95)' },
  availText:     { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  availTextIn:   { color: '#059669' },
  availTextOut:  { color: '#DC2626' },

  productBody:        { padding: 12, gap: 6 },
  productBodyCompact: { padding: 10, gap: 4 },

  productName:        { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#111827' },
  productNameCompact: { fontSize: 13 },
  productDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 18,
  },

  productFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  productPrice:        { fontSize: 15, fontFamily: 'Poppins-Bold',    color: '#111827' },
  productPriceCompact: { fontSize: 13 },
  minQty: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginTop: 2 },

  // Add button — pill (single column) or circle (grid)
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CE4002',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CE4002',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: '#D1D5DB' },
  addBtnText:     { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#fff' },

  // ── Modal / bottom sheet ────────────────────────────────────────────────────
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E8E8E8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    flex: 1,
  },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#374151', marginBottom: 8 },
  picker: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: '#F4F4F4',
  },
  pickerText:        { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#111827' },
  pickerPlaceholder: { color: '#9CA3AF' },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    flex: 1, height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: '#F4F4F4',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  minQtyHint: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginTop: 6 },

  pricePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF0E6',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  pricePreviewLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  pricePreviewValue: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#CE4002' },

  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#CE4002',
    height: 54,
    borderRadius: 14,
    marginBottom: 4,
  },
  confirmBtnDisabled: { backgroundColor: '#E8A07A' },
  confirmBtnText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },

  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerOptionActive:     { backgroundColor: '#FEF0E6' },
  pickerOptionText:       { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#374151' },
  pickerOptionTextActive: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
  unitPrice:              { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#6B7280' },
})
