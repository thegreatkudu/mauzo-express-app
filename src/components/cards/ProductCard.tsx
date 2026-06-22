// Snapcart "Featured Products" card — clean white card with:
//   · Full-width square product image area (gradient placeholder)
//   · Overlay badges (Hot / Sale / -N%) top-left
//   · Wishlist circle button top-right
//   · Brand label → product name (2 lines) → rating+sold row → price row
//   · Pill "Add" button bottom-right
//   · Snapcart shadow: rgba(0,0,0,0.05) 0px 1px 2px 0px
import { memo, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Product } from '@/types'
import { CATEGORY_META } from '@/data/mock'
import { useCartStore } from '@/store/cart.store'
import {
  CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON,
  WishlistIcon, StarIcon, AddIcon, TickIcon,
} from '@/constants/icons'
import { C, F, R, S, TS, shadowStyles } from '@/theme'

interface BadgeConfig { label: string; bg: string; text: string }

function resolveBadge(product: Product): BadgeConfig | null {
  if (product.isFeatured)        return { label: 'HOT',             bg: '#ef4444', text: '#fff' }
  if (product.isNew)             return { label: 'NEW',             bg: '#22c55e', text: '#fff' }
  if ((product.discountPercentage ?? 0) >= 20)
                                 return { label: `-${product.discountPercentage}%`, bg: C.primary, text: '#fff' }
  if ((product.discountPercentage ?? 0) > 0)
                                 return { label: 'SALE',            bg: '#f59e0b', text: '#fff' }
  return null
}

interface Props {
  product: Product
  width?: number
  onPress?: () => void
  onWishlistToggle?: (id: string, wishlisted: boolean) => void
  isWishlisted?: boolean
  /** 'grid' = compact vertical, 'list' = horizontal row */
  variant?: 'grid' | 'list'
}

function ProductCard({ product, width, onPress, onWishlistToggle, isWishlisted = false, variant = 'grid' }: Props) {
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [added, setAdded]           = useState(false)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const addItem   = useCartStore(s => s.addItem)

  const meta         = CATEGORY_META[product.category] ?? { color: C.primary, icon: 'bag-outline', bg: C.primaryLight }
  const categoryIcon = CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON
  const badge        = resolveBadge(product)
  const stars        = Math.min(5, Math.round(product.averageRating))
  const hasDiscount  = !!product.originalPrice && product.originalPrice > product.price

  function pressIn()  { Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start() }
  function pressOut() { Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start() }

  function handleAdd() {
    addItem(product, undefined, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function handleWishlist() {
    const next = !wishlisted
    setWishlisted(next)
    onWishlistToggle?.(product._id, next)
  }

  /* ── List (horizontal) variant ─────────────────────────────────────────── */
  if (variant === 'list') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.listCard, shadowStyles.product]}>
        {/* image */}
        <View style={styles.listImage}>
          {product.image ? (
            <Image source={product.image} style={styles.realImageList} resizeMode='cover' />
          ) : (
            <LinearGradient colors={[meta.color + '28', meta.color + '08']} style={StyleSheet.absoluteFill}>
              <View style={[styles.iconBubble, { backgroundColor: meta.color + '20', alignSelf: 'center', marginTop: 20 }]}>
                <HugeiconsIcon icon={categoryIcon} size={28} color={meta.color} strokeWidth={1.5} />
              </View>
            </LinearGradient>
          )}
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          )}
        </View>
        {/* info */}
        <View style={styles.listInfo}>
          <Text style={styles.brandLabel} numberOfLines={1}>{product.vendorName ?? product.category}</Text>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.original}>${product.originalPrice!.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <HugeiconsIcon key={i} icon={StarIcon} size={9} color={i < stars ? C.star : C.border} strokeWidth={1.5} />
            ))}
            <Text style={styles.ratingText}>{product.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.totalReviews})</Text>
          </View>
        </View>
        {/* add btn */}
        <TouchableOpacity
          style={[styles.listAddBtn, { backgroundColor: added ? C.success : meta.color }]}
          onPress={handleAdd}
          hitSlop={6}
        >
          <HugeiconsIcon icon={added ? TickIcon : AddIcon} size={14} color='#fff' strokeWidth={2} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  /* ── Grid (vertical) variant — Snapcart card ────────────────────────────── */
  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }, width ? { width } : {}]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={styles.cardInner}
      >
        {/* ── Image area ──────────────────────────────────────────────────── */}
        <View style={styles.imageWrap}>
          {product.image ? (
            <Image source={product.image} style={styles.realImage} resizeMode='cover' />
          ) : (
            <LinearGradient colors={[meta.color + '28', meta.color + '0A']} style={styles.image}>
              <View style={[styles.iconBubble, { backgroundColor: meta.color + '20' }]}>
                <HugeiconsIcon icon={categoryIcon} size={30} color={meta.color} strokeWidth={1.5} />
              </View>
            </LinearGradient>
          )}

          {/* Snapcart: badge overlaid top-left of image */}
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          )}

          {/* Snapcart: wishlist circle top-right of image */}
          <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist} hitSlop={6} activeOpacity={0.8}>
            <HugeiconsIcon
              icon={WishlistIcon}
              size={13}
              color={wishlisted ? '#ef4444' : C.textMuted}
              strokeWidth={wishlisted ? 2 : 1.5}
            />
          </TouchableOpacity>
        </View>

        {/* ── Info body ───────────────────────────────────────────────────── */}
        <View style={styles.info}>
          {/* brand / vendor label */}
          <Text style={styles.brandLabel} numberOfLines={1}>{product.vendorName ?? product.category}</Text>

          {/* product name — Snapcart allows 2 lines */}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

          {/* rating + sold count — Snapcart shows "3.6  Sold 143" */}
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <HugeiconsIcon key={i} icon={StarIcon} size={9} color={i < stars ? C.star : C.border} strokeWidth={1.5} />
            ))}
            <Text style={styles.ratingText}>{product.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>· Sold {product.totalReviews}</Text>
          </View>

          {/* price row */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              {hasDiscount && (
                <Text style={styles.original}>${product.originalPrice!.toFixed(2)}</Text>
              )}
            </View>

            {/* Snapcart "Add to Cart" — compact icon pill bottom-right */}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: added ? C.success : meta.color }]}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <HugeiconsIcon icon={added ? TickIcon : AddIcon} size={13} color='#fff' strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default memo(ProductCard)

const styles = StyleSheet.create({
  /* ── Grid card ─────────────────────────────────────────────────────────── */
  card: {
    backgroundColor: C.surface,
    borderRadius: R.sm,       // Snapcart uses ~8px radius
    overflow: 'hidden',
    ...shadowStyles.product,
  },
  cardInner: { flex: 1 },

  imageWrap: { position: 'relative' },
  image: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realImage: {
    width: '100%',
    height: 140,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Snapcart badge: pill top-left of image */
  badge: {
    position: 'absolute',
    top: S.sm,
    left: S.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  badgeText: {
    fontSize: TS.xs,
    fontFamily: F.bold,
    letterSpacing: 0.4,
  },

  /* Snapcart wishlist: white circle top-right */
  wishBtn: {
    position: 'absolute',
    top: S.sm,
    right: S.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.card,
  },

  /* info section */
  info: {
    padding: S.md,
    gap: 4,
  },
  brandLabel: {
    fontSize: TS.xs,
    fontFamily: F.bold,
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: TS.md,
    fontFamily: F.semiBold,
    color: C.text,
    lineHeight: 18,
  },

  /* Snapcart rating row */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingText: {
    fontSize: TS.xs,
    fontFamily: F.semiBold,
    color: C.star,
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: TS.xs,
    fontFamily: F.regular,
    color: C.textMuted,
    marginLeft: 2,
  },

  /* price row */
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    fontSize: TS.xl,
    fontFamily: F.bold,
    color: C.text,
  },
  original: {
    fontSize: TS.xs,
    fontFamily: F.regular,
    color: C.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  /* Add button */
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── List card ─────────────────────────────────────────────────────────── */
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.sm,
    overflow: 'hidden',
    marginBottom: S.sm,
  },
  listImage: {
    width: 90,
    height: 90,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  realImageList: {
    width: 90,
    height: 90,
  },
  listInfo: {
    flex: 1,
    padding: S.md,
    gap: 3,
  },
  listAddBtn: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: S.md,
    flexShrink: 0,
  },
})
