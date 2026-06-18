// Snapcart "Featured Products" section.
// · Section header with badge count + "View All"
// · 2-column FlatList grid of Snapcart-style ProductCards
// · Skeleton loading state (animated shimmer)
// · Switch between grid and list view modes
import { memo, useCallback, useState } from 'react'
import {
  Animated, Dimensions, FlatList, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native'
import ProductCard from '@/components/cards/ProductCard'
import { Product } from '@/types'
import { C, F, R, S, TS, shadowStyles } from '@/theme'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { GridIcon, SortIcon } from '@/constants/icons'

const { width } = Dimensions.get('window')
const GRID_COLS  = 2
const CARD_GAP   = S.sm
const CARD_WIDTH = (width - S.page * 2 - CARD_GAP * (GRID_COLS - 1)) / GRID_COLS

/* ── Skeleton card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  const anim = new Animated.Value(0.4)
  Animated.loop(
    Animated.sequence([
      Animated.timing(anim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
    ])
  ).start()

  return (
    <Animated.View style={[styles.skeleton, { width: CARD_WIDTH, opacity: anim }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonLine, { width: '50%', height: 8 }]} />
        <View style={[styles.skeletonLine, { width: '90%', height: 12 }]} />
        <View style={[styles.skeletonLine, { width: '70%', height: 10 }]} />
        <View style={styles.skeletonPriceRow}>
          <View style={[styles.skeletonLine, { width: 60, height: 14 }]} />
          <View style={styles.skeletonBtn} />
        </View>
      </View>
    </Animated.View>
  )
}

interface Props {
  products: Product[]
  loading?: boolean
  onProductPress?: (product: Product) => void
  onWishlistToggle?: (id: string, wishlisted: boolean) => void
  onViewAll?: () => void
  title?: string
  subtitle?: string
  /** IDs of products currently wishlisted */
  wishlisted?: Set<string>
}

type ViewMode = 'grid' | 'list'

function FeaturedProductsSection({
  products, loading = false, onProductPress, onWishlistToggle,
  onViewAll, title = 'Featured Products', subtitle, wishlisted = new Set(),
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      width={viewMode === 'grid' ? CARD_WIDTH : undefined}
      onPress={() => onProductPress?.(item)}
      onWishlistToggle={onWishlistToggle}
      isWishlisted={wishlisted.has(item._id)}
      variant={viewMode}
    />
  ), [viewMode, onProductPress, onWishlistToggle, wishlisted])

  const skeletonData = Array.from({ length: 6 }, (_, i) => String(i))

  return (
    <View>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.accentBar} />
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {/* product count badge — Snapcart shows the count */}
          {products.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{products.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {/* view mode toggle */}
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'grid' && styles.modeBtnActive]}
            onPress={() => setViewMode('grid')}
            hitSlop={6}
          >
            <HugeiconsIcon icon={GridIcon} size={15} color={viewMode === 'grid' ? C.primary : C.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'list' && styles.modeBtnActive]}
            onPress={() => setViewMode('list')}
            hitSlop={6}
          >
            <HugeiconsIcon icon={SortIcon} size={15} color={viewMode === 'list' ? C.primary : C.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>

          {onViewAll && (
            <TouchableOpacity onPress={onViewAll} hitSlop={10} activeOpacity={0.7}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {skeletonData.map(k => <SkeletonCard key={k} />)}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p._id}
          renderItem={renderProduct}
          numColumns={viewMode === 'grid' ? GRID_COLS : 1}
          key={viewMode}    // force remount when switching columns
          scrollEnabled={false}
          contentContainerStyle={
            viewMode === 'grid'
              ? styles.gridContent
              : styles.listContent
          }
          columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          }
          removeClippedSubviews
        />
      )}
    </View>
  )
}

export default memo(FeaturedProductsSection)

const styles = StyleSheet.create({
  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: S.page,
    marginBottom: S.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: R.xs,
    backgroundColor: C.primary,
  },
  title: {
    fontSize: TS.h4,
    fontFamily: F.bold,
    color: C.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: TS.sm,
    fontFamily: F.regular,
    color: C.textMuted,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: R.full,
  },
  countText: {
    fontSize: TS.xs,
    fontFamily: F.bold,
    color: C.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  modeBtn: {
    width: 28,
    height: 28,
    borderRadius: R.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.borderLight,
  },
  modeBtnActive: {
    backgroundColor: C.primaryLight,
  },
  viewAll: {
    fontSize: TS.md,
    fontFamily: F.semiBold,
    color: C.primary,
  },

  /* grid */
  gridContent: {
    paddingHorizontal: S.page,
    paddingBottom: S.xs,
    gap: CARD_GAP,
  },
  row: {
    gap: CARD_GAP,
  },

  /* list */
  listContent: {
    paddingHorizontal: S.page,
    gap: S.xs,
  },

  /* skeleton */
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: S.page,
    gap: CARD_GAP,
  },
  skeleton: {
    backgroundColor: C.surface,
    borderRadius: R.sm,
    overflow: 'hidden',
    ...shadowStyles.product,
  },
  skeletonImage: {
    height: 140,
    backgroundColor: C.borderLight,
  },
  skeletonInfo: {
    padding: S.md,
    gap: 6,
  },
  skeletonLine: {
    backgroundColor: C.borderLight,
    borderRadius: R.xs,
  },
  skeletonPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  skeletonBtn: {
    width: 30,
    height: 30,
    borderRadius: R.sm,
    backgroundColor: C.borderLight,
  },

  /* empty */
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: TS.md, fontFamily: F.regular, color: C.textMuted },
})
