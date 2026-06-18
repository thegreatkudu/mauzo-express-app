// Snapcart "Latest Articles" → Vendor showcase section.
// · Horizontal FlatList of article-card style VendorCards
// · Compact "row" list variant also available
// · Section header with accent bar + "See All"
import { memo, useCallback } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import VendorCard from '@/components/cards/VendorCard'
import { Vendor } from '@/types'
import { C, F, R, S, TS } from '@/theme'

interface Props {
  vendors: Vendor[]
  onVendorPress?: (vendor: Vendor) => void
  onSeeAll?: () => void
  title?: string
  subtitle?: string
  variant?: 'card' | 'row'
}

function VendorShowcaseSection({
  vendors, onVendorPress, onSeeAll,
  title = 'Top Vendors',
  subtitle = 'Verified shops near you',
  variant = 'card',
}: Props) {
  const renderCard = useCallback(({ item }: { item: Vendor }) => (
    <VendorCard
      vendor={item}
      onPress={() => onVendorPress?.(item)}
      variant={variant}
    />
  ), [variant, onVendorPress])

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
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} hitSlop={10} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        )}
      </View>

      {variant === 'card' ? (
        /* ── Horizontal card scroll (Snapcart article-card style) ── */
        <FlatList
          data={vendors}
          keyExtractor={v => v._id}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardList}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: 212,  // card width 200 + 12 gap
            offset: 212 * index + S.page,
            index,
          })}
        />
      ) : (
        /* ── Vertical row list ── */
        <View style={styles.rowList}>
          {vendors.map(v => (
            <VendorCard
              key={v._id}
              vendor={v}
              onPress={() => onVendorPress?.(v)}
              variant='row'
            />
          ))}
        </View>
      )}
    </View>
  )
}

export default memo(VendorShowcaseSection)

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
  seeAll: {
    fontSize: TS.md,
    fontFamily: F.semiBold,
    color: C.primary,
  },
  cardList: {
    paddingHorizontal: S.page,
    gap: S.md,
    paddingBottom: S.xs,
  },
  rowList: {
    paddingHorizontal: S.page,
  },
})
