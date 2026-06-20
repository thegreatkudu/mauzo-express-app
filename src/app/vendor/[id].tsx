// TODO: Replace with Flask API once backend integration begins.

import { useMemo } from 'react'
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useSuppliers, useSupplierProducts } from '@/hooks/useSuppliers'
import { useResponsive } from '@/hooks/useResponsive'
import EmptyState from '@/components/ui/EmptyState'
import {
  BackIcon, BuildingIcon, LocationIcon,
  PackageIcon, ChevronRightIcon,
} from '@/constants/icons'

export default function SupplierProfileScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const supplierId = Number(id)
  const { rf, hp, isTablet } = useResponsive()

  const {
    data: suppliers,
    isLoading: suppliersLoading,
    isError: suppliersError,
    refetch: refetchSuppliers,
    isRefetching,
  } = useSuppliers()

  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useSupplierProducts(supplierId)

  const supplier = useMemo(
    () => suppliers?.find(s => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )

  const featuredProducts = useMemo(() => (products ?? []).slice(0, 6), [products])

  function refetch() {
    refetchSuppliers()
    refetchProducts()
  }

  if (suppliersLoading || productsLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <View style={styles.center}>
          <ActivityIndicator color='#CE4002' size='large' />
        </View>
      </SafeAreaView>
    )
  }

  if (suppliersError || !supplier) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader onBack={() => router.back()} rf={rf} hp={hp} isTablet={isTablet} />
        <EmptyState
          icon={BuildingIcon as any}
          title={t('supplier_profile.not_found_title')}
          subtitle={t('supplier_profile.not_found_subtitle')}
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
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
        }
      >
        {/* ── Profile hero ── */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { width: isTablet ? 88 : 72, height: isTablet ? 88 : 72, borderRadius: isTablet ? 26 : 22 }]}>
            <HugeiconsIcon icon={BuildingIcon} size={isTablet ? 44 : 34} color='#CE4002' strokeWidth={1.5} />
          </View>

          <Text style={[styles.heroName, { fontSize: rf(20) }]}>{supplier.business_name}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={LocationIcon} size={13} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={[styles.metaText, { fontSize: rf(13) }]}>{supplier.location}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={PackageIcon} size={13} color='#9CA3AF' strokeWidth={1.5} />
              <Text style={[styles.metaText, { fontSize: rf(13) }]}>
                {t(
                  supplier.product_count !== 1
                    ? 'supplier_card.products_other'
                    : 'supplier_card.products_one',
                  { count: supplier.product_count },
                )}
              </Text>
            </View>
          </View>

          <View style={styles.categoryChip}>
            <Text style={[styles.categoryText, { fontSize: rf(12) }]}>
              {supplier.category.name}
            </Text>
          </View>
        </View>

        {/* ── Featured products ── */}
        {featuredProducts.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: rf(15) }]}>
              {t('supplier_profile.products_title')}
            </Text>
            {featuredProducts.map((product, i) => (
              <View
                key={product.id}
                style={[styles.productRow, i > 0 && styles.productRowBorder]}
              >
                <View style={styles.productLeft}>
                  <Text style={[styles.productName, { fontSize: rf(14) }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productMeta, { fontSize: rf(12) }]}>
                    TZS {product.base_price.toLocaleString()}
                    {' · '}
                    {product.is_available
                      ? t('supplier_products.in_stock')
                      : t('supplier_products.out_of_stock')}
                  </Text>
                </View>
                <View style={[
                  styles.availDot,
                  product.is_available ? styles.availDotIn : styles.availDotOut,
                ]} />
              </View>
            ))}
          </View>
        )}

        {/* ── Browse all products CTA ── */}
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => router.push({
            pathname: '/supplier/[id]',
            params: { id: String(supplier.id), name: supplier.business_name },
          } as any)}
          activeOpacity={0.88}
        >
          <HugeiconsIcon icon={PackageIcon} size={18} color='#fff' strokeWidth={1.5} />
          <Text style={[styles.browseBtnText, { fontSize: rf(15) }]}>
            {t('supplier_profile.browse_products')}
          </Text>
          <HugeiconsIcon icon={ChevronRightIcon} size={16} color='rgba(255,255,255,0.8)' strokeWidth={2} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function ScreenHeader({ onBack, rf, hp, isTablet }: {
  onBack: () => void
  rf: (s: number) => number
  hp: number
  isTablet: boolean
}) {
  const { t } = useTranslation()
  const btnSize   = isTablet ? 46 : 40
  const btnRadius = isTablet ? 15 : 13
  return (
    <View style={[styles.header, { paddingHorizontal: hp }]}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={8}
        activeOpacity={0.7}
        style={[styles.backBtn, { width: btnSize, height: btnSize, borderRadius: btnRadius }]}
      >
        <HugeiconsIcon
          icon={BackIcon}
          size={isTablet ? 22 : 20}
          color='#111827'
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { fontSize: rf(17) }]} numberOfLines={1}>
        {t('supplier_profile.header_title')}
      </Text>
      <View style={{ width: btnSize }} />
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F6F6F4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },

  scroll: { paddingTop: 18, paddingBottom: 32, gap: 14 },

  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  heroIconWrap: {
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroName: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 28,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:   { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  metaDivider: { width: 1, height: 14, backgroundColor: '#E8E8E8' },

  categoryChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: { fontFamily: 'Poppins-SemiBold', color: '#3B82F6' },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 2,
  },
  cardTitle: { fontFamily: 'Poppins-SemiBold', color: '#111827', marginBottom: 8 },

  // ── Product rows ─────────────────────────────────────────────────────────────
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  productRowBorder: { borderTopWidth: 1, borderTopColor: '#F4F4F4' },
  productLeft:  { flex: 1, gap: 2 },
  productName:  { fontFamily: 'Poppins-Medium', color: '#111827' },
  productMeta:  { fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  availDot:     { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  availDotIn:   { backgroundColor: '#10B981' },
  availDotOut:  { backgroundColor: '#EF4444' },

  // ── Browse CTA ───────────────────────────────────────────────────────────────
  browseBtn: {
    backgroundColor: '#CE4002',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    shadowColor: '#CE4002',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  browseBtnText: { fontFamily: 'Poppins-Bold', color: '#fff', flex: 1, textAlign: 'center' },
})
