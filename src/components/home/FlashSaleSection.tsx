import { memo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import CountdownTimer from '@/components/ui/CountdownTimer'
import { Product } from '@/types'
import { CATEGORY_META } from '@/data/mock'
import { useCartStore } from '@/store/cart.store'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, WishlistIcon, AddIcon, TickIcon, StarIcon } from '@/constants/icons'
import { COLORS, FONT, RADIUS, SPACING } from '@/constants/theme'
import { shadowStyles } from '@/theme'

interface Props {
  products: Product[]
  endsAt: Date
  onSeeAll?: () => void
  onProductPress?: (product: Product) => void
}

// ── Individual flash deal card ────────────────────────────────────────────────
function FlashCard({ product, onPress }: { product: Product; onPress?: () => void }) {
  const [wishlist, setWishlist] = useState(false)
  const [added,    setAdded]    = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const meta = CATEGORY_META[product.category] ?? { color: COLORS.primary, icon: 'bag-outline', bg: COLORS.primaryLight }
  const categoryIcon = CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON
  const stars = Math.min(5, Math.round(product.averageRating))

  function handleAdd() {
    addItem(product, undefined, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={styles.card}>
      {/* image area */}
      <View style={styles.imageWrap}>
        <LinearGradient colors={[meta.color + '30', meta.color + '10']} style={styles.imageBg}>
          <HugeiconsIcon icon={categoryIcon} size={36} color={meta.color} strokeWidth={1.5} />
        </LinearGradient>

        {/* discount badge */}
        {product.discountPercentage && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
          </View>
        )}

        {/* wishlist */}
        <TouchableOpacity
          style={styles.wishBtn}
          onPress={() => setWishlist(w => !w)}
          hitSlop={6}
          activeOpacity={0.8}
        >
          <HugeiconsIcon
            icon={WishlistIcon}
            size={13}
            color={wishlist ? COLORS.error : '#9CA3AF'}
            strokeWidth={wishlist ? 2 : 1.5}
          />
        </TouchableOpacity>
      </View>

      {/* info */}
      <View style={styles.info}>
        <Text style={styles.vendor} numberOfLines={1}>{product.vendorName}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* rating */}
        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <HugeiconsIcon key={i} icon={StarIcon} size={8} color={i < stars ? COLORS.star : COLORS.borderMed} strokeWidth={1.5} />
          ))}
          <Text style={styles.ratingCount}>({product.totalReviews})</Text>
        </View>

        {/* price + add btn */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.original}>${product.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: added ? COLORS.success : meta.color }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <HugeiconsIcon icon={added ? TickIcon : AddIcon} size={14} color='#fff' strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function FlashSaleSection({ products, endsAt, onSeeAll, onProductPress }: Props) {
  return (
    <View>
      {/* header banner */}
      <LinearGradient
        colors={['#1A1A2E', '#2c489f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* decorative circles */}
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <View style={styles.headerLeft}>
          <View style={styles.flashBadge}>
            <Text style={styles.flashBadgeText}>⚡ FLASH SALE</Text>
          </View>
          <Text style={styles.headerTitle}>Today's Deals</Text>
          <Text style={styles.headerSub}>Ends in</Text>
        </View>

        <CountdownTimer endsAt={endsAt} variant='blocks' />
      </LinearGradient>

      {/* see all link */}
      <View style={styles.seeAllRow}>
        <Text style={styles.seeAllText} onPress={onSeeAll}>View all deals →</Text>
      </View>

      {/* product scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {products.map(p => (
          <FlashCard key={p._id} product={p} onPress={() => onProductPress?.(p)} />
        ))}
      </ScrollView>
    </View>
  )
}

export default memo(FlashSaleSection)

const styles = StyleSheet.create({
  /* header */
  header: {
    marginHorizontal: SPACING.page,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadowStyles.product,
  },
  headerCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -40,
    right: -20,
  },
  headerCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    left: 80,
  },
  headerLeft: {
    gap: 3,
  },
  flashBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  flashBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONT.bold,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.6)',
  },

  /* see all */
  seeAllRow: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.page,
    marginTop: 10,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: FONT.semiBold,
    color: COLORS.primary,
  },

  /* scroll */
  scroll: {
    paddingHorizontal: SPACING.page,
    gap: 12,
    paddingBottom: 4,
  },

  /* flash card */
  card: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  imageWrap: {
    position: 'relative',
  },
  imageBg: {
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONT.bold,
  },
  wishBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.card,
  },
  info: {
    padding: 10,
    gap: 3,
  },
  vendor: {
    fontSize: 9,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: '#111827',
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingCount: {
    fontSize: 9,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#111827',
  },
  original: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
