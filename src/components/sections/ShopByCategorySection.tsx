// Snapcart "Shop by Category" section.
// Renders circle-based CategoryCards in a horizontal FlatList with:
//   · Section header + "View All" link
//   · Optimised FlatList (keyExtractor, getItemLayout, removeClippedSubviews)
//   · Animated active state transitions
import { memo, useCallback } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CategoryCard from '@/components/cards/CategoryCard'
import { Category } from '@/types'
import { C, F, R, S, TS, shadowStyles } from '@/theme'

interface Props {
  categories: Category[]
  selected?: string
  onSelect?: (cat: Category) => void
  onViewAll?: () => void
  title?: string
  subtitle?: string
  /** counts[category.id] → product count shown on badge */
  counts?: Record<string, number>
}

function ShopByCategorySection({
  categories, selected, onSelect, onViewAll,
  title = 'Shop by Category',
  subtitle,
  counts,
}: Props) {
  const renderItem = useCallback(({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      isActive={selected === item.id}
      onPress={onSelect}
      count={counts?.[item.id]}
    />
  ), [selected, onSelect, counts])

  return (
    <View>
      {/* ── Section header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.accentBar} />
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} hitSlop={10} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Horizontal FlatList ── */}
      <FlatList
        data={categories}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: 88,   // CategoryCard wrapper width = 80 + 8 gap
          offset: 88 * index + S.page,
          index,
        })}
        ListEmptyComponent={<Text style={styles.empty}>No categories available</Text>}
      />
    </View>
  )
}

export default memo(ShopByCategorySection)

const styles = StyleSheet.create({
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
  viewAll: {
    fontSize: TS.md,
    fontFamily: F.semiBold,
    color: C.primary,
  },
  list: {
    paddingHorizontal: S.page,
    gap: S.sm,
    paddingBottom: S.xs,
  },
  empty: {
    fontSize: TS.base,
    fontFamily: F.regular,
    color: C.textMuted,
    paddingHorizontal: S.page,
  },
})
