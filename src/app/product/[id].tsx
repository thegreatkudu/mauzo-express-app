// TODO: Replace with Flask API once backend integration begins.

import { useEffect, useState } from 'react'
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'
import { useTranslation } from 'react-i18next'

import { useSupplierProducts } from '@/hooks/useSuppliers'
import { addToCart } from '@/api/cart'
import { useCartStore } from '@/store/cart.store'
import { extractApiError } from '@/api/client'
import { useResponsive } from '@/hooks/useResponsive'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import EmptyState from '@/components/ui/EmptyState'
import {
  BackIcon, PackageIcon, BuildingIcon,
  CheckCircleIcon, AddIcon, MinusIcon,
  AlertCircleIcon, RefreshIcon,
} from '@/constants/icons'
import type { AppTheme } from '@/hooks/use-theme'
import type { Brand, Unit } from '@/types'
import { shadows } from '@/theme'

export default function ProductDetailScreen() {
  const { t } = useTranslation()
  const {
    id,
    supplierId: supplierIdParam,
    supplierName,
  } = useLocalSearchParams<{ id: string; supplierId?: string; supplierName?: string }>()

  const productId  = Number(id)
  const supplierId = Number(supplierIdParam ?? '0')

  // Leverages React Query cache — no extra network call if supplier products
  // were already fetched by supplier/[id].tsx during this session.
  const { data: products, isLoading, isError, refetch } = useSupplierProducts(supplierId)
  const product = products?.find(p => p.id === productId) ?? null

  const { fetchCart } = useCartStore()
  const { rf, hp, isTablet } = useResponsive()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [selectedUnit,  setSelectedUnit]  = useState<Unit | null>(null)
  const [quantity,      setQuantity]      = useState(1)
  const [adding,        setAdding]        = useState(false)

  useEffect(() => {
    if (product) setQuantity(product.min_order_quantity)
  }, [product?.id])

  const pricePreview = selectedUnit ? selectedUnit.price * quantity : 0
  const bottomBarH   = (isTablet ? 152 : 136) + insets.bottom

  async function handleAddToCart() {
    if (!product) return
    if (!selectedBrand) { toast.error(t('supplier_products.error_no_brand')); return }
    if (!selectedUnit)  { toast.error(t('supplier_products.error_no_unit'));   return }
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
      router.back()
    } catch (err) {
      toast.error(extractApiError(err).message || t('supplier_products.add_error'))
    } finally {
      setAdding(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size='large' />
        </View>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <View style={styles.center}>
          <HugeiconsIcon icon={AlertCircleIcon} size={40} color={theme.colors.textDisabled} strokeWidth={1.5} />
          <Text style={[styles.stateText, { fontSize: rf(14) }]}>{t('product_detail.error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
            <HugeiconsIcon icon={RefreshIcon} size={16} color={theme.colors.primary} strokeWidth={2} />
            <Text style={[styles.retryText, { fontSize: rf(14) }]}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <EmptyState
          icon={PackageIcon as any}
          title={t('product_detail.not_found_title')}
          subtitle={t('product_detail.not_found_subtitle')}
          actionLabel={t('product_detail.go_back')}
          onAction={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: hp, paddingBottom: bottomBarH + 16 },
        ]}
      >
        {/* ── Image ── */}
        {product.image_url ? (
          <Image
            source={product.image_url}
            style={styles.productImage}
            contentFit='cover'
            cachePolicy='memory-disk'
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <HugeiconsIcon icon={PackageIcon} size={52} color={theme.colors.textDisabled} strokeWidth={1.5} />
          </View>
        )}

        {/* ── Info card ── */}
        <View style={styles.card}>
          <View style={styles.nameRow}>
            <Text style={[styles.productName, { fontSize: rf(18) }]} numberOfLines={3}>
              {product.name}
            </Text>
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

          <View style={styles.supplierRow}>
            <HugeiconsIcon icon={BuildingIcon} size={13} color={theme.colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.supplierText, { fontSize: rf(13) }]} numberOfLines={1}>
              {supplierName ?? `Supplier #${supplierId}`}
            </Text>
          </View>

          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { fontSize: rf(12) }]}>
              {t('product_detail.min_order', { count: product.min_order_quantity })}
            </Text>
            <Text style={[styles.metaDot, { fontSize: rf(12) }]}>·</Text>
            <Text style={[styles.metaText, { fontSize: rf(12) }]}>
              {t('product_detail.stock_count', { count: product.stock_quantity })}
            </Text>
          </View>
        </View>

        {/* ── Description ── */}
        {!!product.description && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: rf(14) }]}>
              {t('product_detail.description_title')}
            </Text>
            <Text style={[styles.descText, { fontSize: rf(13) }]}>
              {product.description}
            </Text>
          </View>
        )}

        {/* ── Brand selection ── */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: rf(14) }]}>
            {t('product_detail.brands_title')}
          </Text>
          <View style={styles.brandRow}>
            {product.brands.map(brand => (
              <TouchableOpacity
                key={brand.id}
                style={[
                  styles.brandChip,
                  selectedBrand?.id === brand.id && styles.brandChipActive,
                ]}
                onPress={() => setSelectedBrand(brand)}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.brandChipText,
                  { fontSize: rf(13) },
                  selectedBrand?.id === brand.id && styles.brandChipTextActive,
                ]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Unit selection ── */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: rf(14) }]}>
            {t('product_detail.units_title')}
          </Text>
          {product.units.map((unit, i) => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.unitRow, i > 0 && styles.unitRowBorder]}
              onPress={() => setSelectedUnit(unit)}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.unitName,
                { fontSize: rf(14) },
                selectedUnit?.id === unit.id && styles.unitNameActive,
              ]}>
                {unit.name}
              </Text>
              <View style={styles.unitPriceRow}>
                <Text style={[
                  styles.unitPrice,
                  { fontSize: rf(14) },
                  selectedUnit?.id === unit.id && styles.unitPriceActive,
                ]}>
                  TZS {unit.price.toLocaleString()}
                </Text>
                {selectedUnit?.id === unit.id && (
                  <HugeiconsIcon icon={CheckCircleIcon} size={16} color={theme.colors.primary} strokeWidth={2} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={[
        styles.bottomBar,
        {
          paddingHorizontal: hp,
          paddingBottom: insets.bottom + (isTablet ? 16 : 12),
          paddingTop: isTablet ? 16 : 14,
        },
      ]}>
        <View style={styles.bottomTopRow}>
          {/* Quantity stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity(q => Math.max(product.min_order_quantity, q - 1))}
              disabled={quantity <= product.min_order_quantity}
              hitSlop={4}
            >
              <HugeiconsIcon
                icon={MinusIcon}
                size={16}
                color={quantity <= product.min_order_quantity ? theme.colors.textDisabled : theme.colors.textSub}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Text style={[styles.stepQty, { fontSize: rf(15) }]}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity(q => q + 1)}
              hitSlop={4}
            >
              <HugeiconsIcon icon={AddIcon} size={16} color={theme.colors.textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Price preview */}
          {selectedUnit && (
            <View style={styles.pricePreview}>
              <Text style={[styles.priceLabel, { fontSize: rf(12) }]}>
                {t('product_detail.price_preview_label')}
              </Text>
              <Text style={[styles.priceValue, { fontSize: rf(17) }]}>
                TZS {pricePreview.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.addBtn,
            isTablet && styles.addBtnTablet,
            (!product.is_available || adding) && styles.addBtnDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!product.is_available || adding}
          activeOpacity={0.88}
        >
          {adding ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={[styles.addBtnText, { fontSize: rf(16) }]}>
              {product.is_available
                ? t('supplier_products.add_to_cart')
                : t('supplier_products.out_of_stock')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function ScreenHeader({
  onBack, rf, hp, isTablet,
}: {
  onBack: () => void
  rf: (s: number) => number
  hp: number
  isTablet: boolean
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const btnSize   = isTablet ? 46 : 40
  const btnRadius = isTablet ? 15 : 13
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: hp,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    }}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={8}
        activeOpacity={0.7}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: btnRadius,
          backgroundColor: theme.colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.medium,
        }}
      >
        <HugeiconsIcon
          icon={BackIcon}
          size={isTablet ? 22 : 20}
          color={theme.colors.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text style={{
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.text,
        fontSize: rf(17),
      }} numberOfLines={1}>
        {t('product_detail.header_title')}
      </Text>
      <View style={{ width: btnSize }} />
    </View>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },

    // ── Scroll content ────────────────────────────────────────────────────────────
    scroll: { gap: 12, paddingTop: 14 },

    productImage: {
      width: '100%',
      height: 220,
      borderRadius: 16,
      backgroundColor: colors.cardAlt,
    },
    imagePlaceholder: {
      width: '100%',
      height: 220,
      borderRadius: 16,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Cards ────────────────────────────────────────────────────────────────────
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      ...shadows.subtle,
      gap: 8,
    },
    cardTitle: {
      fontFamily: 'Poppins-SemiBold',
      color: colors.text,
      marginBottom: 2,
    },

    // ── Product info ──────────────────────────────────────────────────────────────
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    productName: {
      flex: 1,
      fontFamily: 'Poppins-Bold',
      color: colors.text,
      lineHeight: 26,
    },
    availBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
    availBadgeIn:  { backgroundColor: 'rgba(209,250,229,0.95)' },
    availBadgeOut: { backgroundColor: 'rgba(254,226,226,0.95)' },
    availText:     { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
    availTextIn:   { color: '#059669' },
    availTextOut:  { color: '#DC2626' },

    supplierRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    supplierText: { fontFamily: 'Poppins-Regular', color: colors.textSub, flex: 1 },

    metaDivider: { height: 1, backgroundColor: colors.divider },
    metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText:    { fontFamily: 'Poppins-Regular', color: colors.textMuted },
    metaDot:     { color: colors.textDisabled, fontFamily: 'Poppins-Regular' },

    // ── Description ──────────────────────────────────────────────────────────────
    descText: {
      fontFamily: 'Poppins-Regular',
      color: colors.textSub,
      lineHeight: 22,
    },

    // ── Brands ───────────────────────────────────────────────────────────────────
    brandRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    brandChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
    },
    brandChipActive:     { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    brandChipText:       { fontFamily: 'Poppins-Regular', color: colors.textSub },
    brandChipTextActive: { fontFamily: 'Poppins-SemiBold', color: colors.primary },

    // ── Units ────────────────────────────────────────────────────────────────────
    unitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 11,
      gap: 8,
    },
    unitRowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
    unitName:      { flex: 1, fontFamily: 'Poppins-Regular', color: colors.textSub },
    unitNameActive: { fontFamily: 'Poppins-SemiBold', color: colors.primary },
    unitPriceRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
    unitPrice:     { fontFamily: 'Poppins-SemiBold', color: colors.textSub },
    unitPriceActive: { color: colors.primary },

    // ── Bottom action bar ─────────────────────────────────────────────────────────
    bottomBar: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: 12,
      shadowColor: '#f0f0f0',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    bottomTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    stepBtn: {
      width: 36, height: 36,
      alignItems: 'center', justifyContent: 'center', borderRadius: 8,
    },
    stepQty: {
      fontFamily: 'Poppins-SemiBold',
      color: colors.text,
      minWidth: 38,
      textAlign: 'center',
    },
    pricePreview: { alignItems: 'flex-end' },
    priceLabel:   { fontFamily: 'Poppins-Regular', color: colors.textMuted },
    priceValue:   { fontFamily: 'Poppins-Bold', color: colors.text },

    addBtn: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnTablet:   { height: 58, borderRadius: 16 },
    addBtnDisabled: { backgroundColor: colors.primaryMuted },
    addBtnText:     { fontFamily: 'Poppins-Bold', color: '#fff' },

    // ── Error / retry ─────────────────────────────────────────────────────────────
    stateText: { fontFamily: 'Poppins-Regular', color: colors.textSub, textAlign: 'center' },
    retryBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 20, paddingVertical: 10,
      borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary,
    },
    retryText: { fontFamily: 'Poppins-SemiBold', color: colors.primary },
  })
}
