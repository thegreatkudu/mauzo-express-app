import { useMemo, useState } from 'react'
import {
  RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'

import { useTranslation } from 'react-i18next'
import { useOrders } from '@/hooks/useOrders'
import { useResponsive } from '@/hooks/useResponsive'
import OrderCard from '@/components/OrderCard'
import EmptyState from '@/components/ui/EmptyState'
import { OrderCardSkeleton } from '@/components/skeletons'
import { OrdersIcon, RefreshIcon, SearchIcon, CloseIcon } from '@/constants/icons'
import { formatDate } from '@/utils/date'
import type { Order, OrderStatus } from '@/types'

type FilterKey = 'all' | 'awaiting_quote' | 'quote_received' | 'accepted' | 'completed'

const COMPLETED_STATUSES: OrderStatus[] = ['dispatched', 'delivered', 'closed']

export default function OrdersScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders()
  const { hp, rf, gap, ordersColumns, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all',            label: t('orders.filter_all') },
    { key: 'awaiting_quote', label: t('orders.filter_awaiting_quote') },
    { key: 'quote_received', label: t('orders.filter_quote_received') },
    { key: 'accepted',       label: t('orders.filter_accepted') },
    { key: 'completed',      label: t('orders.filter_completed') },
  ]

  const filtered = useMemo<Order[]>(() => {
    if (!orders) return []

    let list = orders

    // Apply status filter tab
    if (activeFilter === 'completed') {
      list = list.filter(o => COMPLETED_STATUSES.includes(o.status))
    } else if (activeFilter !== 'all') {
      list = list.filter(o => o.status === activeFilter)
    }

    // Apply search query
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(o =>
        o.order_id.toLowerCase().includes(q) ||
        o.supplier.business_name.toLowerCase().includes(q) ||
        o.status.replace(/_/g, ' ').includes(q) ||
        o.items.some(item => item.product.name.toLowerCase().includes(q)) ||
        formatDate(o.created_at).toLowerCase().includes(q)
      )
    }

    return list
  }, [orders, activeFilter, search])

  const isMultiCol = ordersColumns > 1
  const hasSearch = search.trim().length > 0

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={contentMaxWidth ? { flex: 1, maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : { flex: 1 }}>

        <View style={[styles.header, { paddingHorizontal: hp }]}>
          <Text style={[styles.title, { fontSize: rf(22) }]}>{t('orders.title')}</Text>
          {orders && (
            <Text style={[styles.subtitle, { fontSize: rf(13) }]}>{t('orders.total_other', { count: orders.length })}</Text>
          )}
        </View>

        {/* Search bar */}
        <View style={[styles.searchWrap, { paddingHorizontal: hp }]}>
          <View style={styles.searchBar}>
            <HugeiconsIcon icon={SearchIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { fontSize: rf(14) }]}
              placeholder={t('orders.search_placeholder')}
              placeholderTextColor='#9CA3AF'
              value={search}
              onChangeText={setSearch}
              returnKeyType='search'
              autoCorrect={false}
            />
            {hasSearch && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <HugeiconsIcon icon={CloseIcon} size={16} color='#9CA3AF' strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersRow, { paddingHorizontal: hp }]}
          style={styles.filtersScroll}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterText,
                { fontSize: rf(13) },
                activeFilter === f.key && styles.filterTextActive,
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {isLoading ? (
          <View style={[styles.list, { paddingHorizontal: hp }]}>
            {isMultiCol ? (
              <View style={{ flexDirection: 'row', gap }}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={{ flex: 1 }}>
                    <OrderCardSkeleton />
                  </View>
                ))}
              </View>
            ) : (
              [1, 2, 3].map(i => <OrderCardSkeleton key={i} />)
            )}
          </View>
        ) : isError ? (
          <View style={styles.errorWrap}>
            <Text style={[styles.errorText, { fontSize: rf(14) }]}>{t('orders.error_load')}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <HugeiconsIcon icon={RefreshIcon} size={16} color='#CE4002' strokeWidth={2} />
              <Text style={[styles.retryText, { fontSize: rf(14) }]}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={o => o.order_id}
            numColumns={ordersColumns}
            renderItem={({ item, index }) => {
              if (!isMultiCol) {
                return <OrderCard order={item} onPress={() => router.push(`/order/${item.order_id}`)} />
              }
              const isLastCol = (index + 1) % ordersColumns === 0
              return (
                <View style={[styles.gridItem, !isLastCol && { paddingRight: gap }]}>
                  <OrderCard order={item} onPress={() => router.push(`/order/${item.order_id}`)} />
                </View>
              )
            }}
            contentContainerStyle={{ ...styles.list, paddingHorizontal: hp }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#CE4002' />
            }
            ListEmptyComponent={
              <EmptyState
                icon={OrdersIcon as any}
                title={
                  hasSearch
                    ? t('orders.empty_search_title')
                    : activeFilter === 'all'
                      ? t('orders.empty_all_title')
                      : t('orders.empty_filtered_title')
                }
                subtitle={
                  hasSearch
                    ? t('orders.empty_search_subtitle')
                    : activeFilter === 'all'
                      ? t('orders.empty_all_subtitle')
                      : t('orders.empty_filtered_subtitle')
                }
                actionLabel={!hasSearch && activeFilter === 'all' ? t('common.browse_suppliers') : undefined}
                onAction={!hasSearch && activeFilter === 'all' ? () => router.push('/(tabs)/suppliers') : undefined}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },

  header: { paddingTop: 16, paddingBottom: 4 },
  title:    { fontFamily: 'Poppins-Bold',    color: '#111827' },
  subtitle: { fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 2 },

  searchWrap: { paddingVertical: 8 },
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

  filtersScroll: { flexGrow: 0 },
  filtersRow: {
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  filterTabActive: {
    backgroundColor: '#CE4002',
    borderColor: '#CE4002',
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  list: { paddingBottom: 24 },
  gridItem: { flex: 1, paddingBottom: 10 },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#CE4002',
  },
  retryText: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
})
