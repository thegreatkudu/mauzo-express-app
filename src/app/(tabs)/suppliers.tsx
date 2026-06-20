import { useMemo, useState } from 'react'
import {
  RefreshControl, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'

import { useTranslation } from 'react-i18next'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useResponsive } from '@/hooks/useResponsive'
import SupplierCard from '@/components/SupplierCard'
import EmptyState from '@/components/ui/EmptyState'
import { SupplierCardSkeleton } from '@/components/skeletons'
import { SearchIcon, CloseIcon, SuppliersNavIcon, RefreshIcon } from '@/constants/icons'
import type { Supplier } from '@/types'

export default function SuppliersScreen() {
  const [search, setSearch] = useState('')
  const { data: suppliers, isLoading, isError, refetch, isRefetching } = useSuppliers()
  const { hp, rf, gap, vgap, suppliersColumns, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()

  const filtered = useMemo(() => {
    if (!suppliers) return []
    const q = search.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter(
      s =>
        s.business_name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.category.name.toLowerCase().includes(q)
    )
  }, [suppliers, search])

  function goToProducts(supplier: Supplier) {
    router.push({
      pathname: '/supplier/[id]',
      params: { id: supplier.id, name: supplier.business_name },
    })
  }

  const isMultiCol = suppliersColumns > 1

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={contentMaxWidth
        ? { flex: 1, maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }
        : { flex: 1 }
      }>

        {/* ── Page header ── */}
        <View style={[styles.pageHeader, { paddingHorizontal: hp, paddingTop: vgap }]}>
          <View>
            <Text style={[styles.title, { fontSize: rf(22) }]}>{t('suppliers.title')}</Text>
            <Text style={[styles.titleSub, { fontSize: rf(13) }]}>
              {isLoading
                ? t('suppliers.loading')
                : t(
                    (suppliers?.length ?? 0) !== 1
                      ? 'suppliers.count_in_category_other'
                      : 'suppliers.count_in_category_one',
                    { count: suppliers?.length ?? 0 }
                  )
              }
            </Text>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={[styles.searchWrap, { paddingHorizontal: hp }]}>
          <View style={styles.searchBar}>
            <HugeiconsIcon icon={SearchIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { fontSize: rf(14) }]}
              placeholder={t('suppliers.search_placeholder')}
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
          <View style={[styles.skeletonGrid, { paddingHorizontal: hp }]}>
            {[0, 1, 2].map(row => (
              <View
                key={row}
                style={isMultiCol ? [styles.skeletonRow, { gap }] : undefined}
              >
                {Array.from({ length: isMultiCol ? suppliersColumns : 1 }).map((_, col) => (
                  <View key={col} style={isMultiCol ? { flex: 1 } : undefined}>
                    <SupplierCardSkeleton compact={isMultiCol} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : isError ? (
          <View style={styles.errorWrap}>
            <Text style={[styles.errorText, { fontSize: rf(14) }]}>{t('suppliers.error_load')}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <HugeiconsIcon icon={RefreshIcon} size={16} color='#CE4002' strokeWidth={2} />
              <Text style={[styles.retryText, { fontSize: rf(14) }]}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={item => String(item.id)}
            numColumns={suppliersColumns}
            renderItem={({ item, index }) => {
              if (!isMultiCol) {
                return (
                  <SupplierCard
                    supplier={item}
                    onPress={() => goToProducts(item)}
                    compact={false}
                  />
                )
              }
              const isLastCol = (index + 1) % suppliersColumns === 0
              return (
                <View style={[styles.gridItem, !isLastCol && { paddingRight: gap }]}>
                  <SupplierCard
                    supplier={item}
                    onPress={() => goToProducts(item)}
                    compact
                  />
                </View>
              )
            }}
            ListHeaderComponent={
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionLabel, { fontSize: rf(15) }]}>
                  {t('suppliers.title')}
                </Text>
                <Text style={[styles.sectionCount, { fontSize: rf(13) }]}>
                  {t(
                    filtered.length !== 1
                      ? 'suppliers.count_in_category_other'
                      : 'suppliers.count_in_category_one',
                    { count: filtered.length }
                  )}
                </Text>
              </View>
            }
            contentContainerStyle={{ ...styles.list, paddingHorizontal: hp }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor='#CE4002'
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon={SuppliersNavIcon as any}
                title={search ? t('suppliers.empty_search_title') : t('suppliers.empty_title')}
                subtitle={
                  search
                    ? t('suppliers.empty_search_subtitle')
                    : t('suppliers.empty_subtitle')
                }
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F6F4' },

  pageHeader: {
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title:    { fontFamily: 'Poppins-Bold',    color: '#111827' },
  titleSub: { fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 2 },

  searchWrap: { paddingVertical: 10 },
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

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionLabel: { fontFamily: 'Poppins-Bold',    color: '#111827' },
  sectionCount: { fontFamily: 'Poppins-Regular', color: '#6B7280' },

  skeletonGrid: { paddingVertical: 8, gap: 10 },
  skeletonRow:  { flexDirection: 'row' },

  list:     { paddingBottom: 32, paddingTop: 12 },
  gridItem: { flex: 1, paddingBottom: 12 },

  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CE4002',
  },
  retryText: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
})
