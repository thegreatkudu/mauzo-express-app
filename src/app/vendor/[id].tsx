import { useEffect, useRef, useState } from 'react'
import {
  Animated, Dimensions, FlatList, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HugeiconsIcon } from '@hugeicons/react-native'

import VendorStoreHeader from '@/components/vendor/VendorStoreHeader'
import VendorIdentityBlock from '@/components/vendor/VendorIdentityBlock'
import VendorStatsRow from '@/components/vendor/VendorStatsRow'
import VendorActionRow from '@/components/vendor/VendorActionRow'
import VendorInfoStrip from '@/components/vendor/VendorInfoStrip'
import MessageVendorSheet from '@/components/vendor/MessageVendorSheet'
import ProductCard from '@/components/product-card'
import { MOCK_VENDOR_STORES, MOCK_VENDOR_PRODUCTS } from '@/data/mock'
import { Product, VendorStore } from '@/types'
import { VendorStoreIcon, AlertCircleIcon, ChatIcon } from '@/constants/icons'

const { width } = Dimensions.get('window')
const CARD_W = (width - 16 * 2 - 12) / 2

const SKELETON_COUNT = 6

export default function VendorStorePage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()

  const vendor = MOCK_VENDOR_STORES.find(v => v._id === id)

  const [activeTab, setActiveTab]       = useState('All')
  const [showMessage, setShowMessage]   = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start()

    const t = setTimeout(() => setShowSkeleton(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (!vendor) {
    return (
      <View style={styles.notFound}>
        <HugeiconsIcon icon={VendorStoreIcon} size={48} color='#D1D5DB' strokeWidth={1.5} />
        <Text style={styles.notFoundText}>Vendor not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const allProducts: Product[] = MOCK_VENDOR_PRODUCTS[vendor._id] ?? []

  const tabs = ['All', ...vendor.categories]

  const filteredProducts = activeTab === 'All'
    ? allProducts
    : allProducts.filter(p => p.category.toLowerCase() === activeTab.toLowerCase())

  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[5]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* 0 — cover header */}
        <VendorStoreHeader vendor={vendor} onBack={() => router.back()} onShare={() => {}} />

        {/* 1 — identity */}
        <VendorIdentityBlock vendor={vendor} />

        {/* 2 — stats */}
        <VendorStatsRow vendor={vendor} />

        {/* 3 — actions */}
        <VendorActionRow vendor={vendor} onMessage={() => setShowMessage(true)} />

        {/* 4 — info strip */}
        <VendorInfoStrip vendor={vendor} />

        {/* 5 — sticky category tab bar */}
        <View style={styles.tabBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarInner}
          >
            {tabs.map(tab => {
              const isActive = tab === activeTab
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tab,
                    isActive && { backgroundColor: vendor.color },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* 6 — product grid */}
        <View style={styles.grid}>
          {showSkeleton
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.skeletonCard, { opacity: shimmerOpacity }]}
                />
              ))
            : filteredProducts.length === 0
              ? (
                <View style={styles.empty}>
                  <HugeiconsIcon icon={AlertCircleIcon} size={40} color='#D1D5DB' strokeWidth={1.5} />
                  <Text style={styles.emptyText}>No products in this category</Text>
                </View>
              )
              : filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    width={CARD_W}
                    onPress={() => router.push(`/product/${product._id}`)}
                  />
                ))
          }
        </View>
      </ScrollView>

      {/* Message FAB */}
      <TouchableOpacity
        onPress={() => setShowMessage(true)}
        style={[styles.fab, { backgroundColor: vendor.color, bottom: insets.bottom + 20 }]}
        activeOpacity={0.85}
      >
        <HugeiconsIcon icon={ChatIcon} size={22} color='#fff' strokeWidth={1.5} />
      </TouchableOpacity>

      {/* Message bottom sheet */}
      <MessageVendorSheet
        vendor={vendor}
        visible={showMessage}
        onClose={() => setShowMessage(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* tab bar */
  tabBarWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBarInner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  /* grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  /* skeleton */
  skeletonCard: {
    width: CARD_W,
    height: 220,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },

  /* empty */
  empty: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  /* not found */
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
  },
  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FEF0E6',
    borderRadius: 12,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
})
