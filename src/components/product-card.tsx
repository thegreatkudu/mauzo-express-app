import { memo, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Product } from '@/types'
import { CATEGORY_META } from '@/data/mock'
import { useCartStore } from '@/store/cart.store'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, WishlistIcon, StarIcon, AddIcon, TickIcon } from '@/constants/icons'
import { COLORS, FONT, RADIUS, SPACING } from '@/constants/theme'
import { shadowStyles } from '@/theme'

interface Props {
  product: Product
  onPress?: () => void
  onWishlistToggle?: (id: string, wishlisted: boolean) => void
  width?: number
  isWishlisted?: boolean
  horizontal?: boolean
}

function ProductCard({ product, onPress, onWishlistToggle, width, isWishlisted = false, horizontal = false }: Props) {
  const [wishlist, setWishlist] = useState(isWishlisted)
  const [added, setAdded]       = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const meta = CATEGORY_META[product.category] ?? { color: COLORS.primary, icon: 'bag-outline', bg: COLORS.primaryLight }
  const stars = Math.min(5, Math.round(product.averageRating))
  const hasDiscount = !!product.discountPercentage && product.discountPercentage > 0
  const categoryIcon = CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON

  function toggleWishlist() {
    const next = !wishlist
    setWishlist(next)
    onWishlistToggle?.(product._id, next)
  }

  function handleAddToCart() {
    addItem(product, undefined, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  /* ── horizontal variant (used in search results / related products) ── */
  if (horizontal) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.hCard, width ? { width } : {}]}>
        <View style={styles.hImage}>
          {product.image ? (
            <Image source={product.image} style={styles.realImage} resizeMode='cover' />
          ) : (
            <LinearGradient colors={[meta.color + '28', meta.color + '0A']} style={StyleSheet.absoluteFill}>
              <View style={[styles.iconBubble, { backgroundColor: meta.color + '22', alignSelf: 'center', marginTop: 14 }]}>
                <HugeiconsIcon icon={categoryIcon} size={26} color={meta.color} strokeWidth={1.5} />
              </View>
            </LinearGradient>
          )}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{product.discountPercentage}%</Text>
            </View>
          )}
        </View>
        <View style={styles.hInfo}>
          <Text style={styles.label}>{product.vendorName ?? product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  /* ── vertical card (default grid layout) ── */
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, width ? { width } : {}]}>
      {/* image / gradient area */}
      <View style={styles.imagePlaceholder}>
        {product.image ? (
          <Image source={product.image} style={styles.realImage} resizeMode='cover' />
        ) : (
          <LinearGradient colors={[meta.color + '28', meta.color + '0A']} style={StyleSheet.absoluteFill}>
            <View style={[styles.iconBubble, { backgroundColor: meta.color + '22', alignSelf: 'center', marginTop: 30 }]}>
              <HugeiconsIcon icon={categoryIcon} size={28} color={meta.color} strokeWidth={1.5} />
            </View>
          </LinearGradient>
        )}

        {/* discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{product.discountPercentage}%</Text>
          </View>
        )}

        {/* new badge (only when no discount) */}
        {!hasDiscount && product.isNew && (
          <View style={[styles.discountBadge, styles.newBadge]}>
            <Text style={styles.discountBadgeText}>NEW</Text>
          </View>
        )}

        {/* wishlist button */}
        <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist} hitSlop={6} activeOpacity={0.8}>
          <HugeiconsIcon
            icon={WishlistIcon}
            size={14}
            color={wishlist ? COLORS.error : '#9CA3AF'}
            strokeWidth={wishlist ? 2 : 1.5}
          />
        </TouchableOpacity>
      </View>

      {/* info */}
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>{product.vendorName ?? product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* star rating */}
        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <HugeiconsIcon key={i} icon={StarIcon} size={9} color={i < stars ? COLORS.star : COLORS.borderMed} strokeWidth={1.5} />
          ))}
          <Text style={styles.reviews}>({product.totalReviews})</Text>
        </View>

        {/* pricing + add btn */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.addBtn, { backgroundColor: added ? COLORS.success : meta.color }]}
            hitSlop={4}
            activeOpacity={0.8}
          >
            <HugeiconsIcon icon={added ? TickIcon : AddIcon} size={15} color='#fff' strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default memo(ProductCard)

const styles = StyleSheet.create({
  /* ── vertical card ── */
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...shadowStyles.product,
  },
  imagePlaceholder: {
    height: 130,
    overflow: 'hidden',
    position: 'relative',
  },
  realImage: {
    width: '100%',
    height: 130,
  },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.error,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  newBadge: {
    backgroundColor: COLORS.success,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONT.bold,
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.card,
  },
  info: {
    padding: SPACING.md,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 13,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reviews: {
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
    fontSize: 15,
    fontFamily: FONT.bold,
    color: COLORS.text,
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── horizontal card ── */
  hCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  hImage: {
    height: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  hInfo: {
    padding: SPACING.sm,
    gap: 3,
  },
})
