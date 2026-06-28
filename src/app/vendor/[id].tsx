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
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import EmptyState from '@/components/ui/EmptyState'
import {
  BackIcon, BuildingIcon, LocationIcon,
  PackageIcon, ChevronRightIcon,
} from '@/constants/icons'
import type { AppTheme } from '@/hooks/use-theme'
import { shadows } from '@/theme'

export default function SupplierProfileScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const supplierId = Number(id)
  const { rf, hp, isTablet } = useResponsive()
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)

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
          <ActivityIndicator color={theme.colors.primary} size='large' />
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
      >
        {/* ── Profile hero ── */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { width: isTablet ? 88 : 72, height: isTablet ? 88 : 72, borderRadius: isTablet ? 26 : 22 }]}>
            <HugeiconsIcon icon={BuildingIcon} size={isTablet ? 44 : 34} color={theme.colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={[styles.heroName, { fontSize: rf(20) }]}>{supplier.business_name}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={LocationIcon} size={13} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.metaText, { fontSize: rf(13) }]}>{supplier.location}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={PackageIcon} size={13} color={theme.colors.textMuted} strokeWidth={1.5} />
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
        {t('supplier_profile.header_title')}
      </Text>
      <View style={{ width: btnSize }} />
    </View>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    scroll: { paddingTop: 18, paddingBottom: 32, gap: 14 },

    // ── Hero card ────────────────────────────────────────────────────────────────
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
      ...shadows.subtle,
      gap: 10,
    },
    heroIconWrap: {
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    heroName: {
      fontFamily: 'Poppins-Bold',
      color: colors.text,
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
    metaText:   { fontFamily: 'Poppins-Regular', color: colors.textSub },
    metaDivider: { width: 1, height: 14, backgroundColor: colors.border },

    categoryChip: {
      backgroundColor: colors.infoBg,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    categoryText: { fontFamily: 'Poppins-SemiBold', color: colors.info },

    // ── Card ─────────────────────────────────────────────────────────────────────
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      ...shadows.subtle,
      gap: 2,
    },
    cardTitle: { fontFamily: 'Poppins-SemiBold', color: colors.text, marginBottom: 8 },

    // ── Product rows ─────────────────────────────────────────────────────────────
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      gap: 10,
    },
    productRowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
    productLeft:  { flex: 1, gap: 2 },
    productName:  { fontFamily: 'Poppins-Medium', color: colors.text },
    productMeta:  { fontFamily: 'Poppins-Regular', color: colors.textMuted },
    availDot:     { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
    availDotIn:   { backgroundColor: '#10B981' },
    availDotOut:  { backgroundColor: '#EF4444' },

    // ── Browse CTA ───────────────────────────────────────────────────────────────
    browseBtn: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 10,
      elevation: 6,
    },
    browseBtnText: { fontFamily: 'Poppins-Bold', color: '#fff', flex: 1, textAlign: 'center' },
  })
}
