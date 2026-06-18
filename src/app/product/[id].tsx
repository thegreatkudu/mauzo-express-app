import { useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'

import SizeSelector from '@/components/product/SizeSelector'
import ColorSelector from '@/components/product/ColorSelector'
import SellerInfoBlock from '@/components/product/SellerInfoBlock'
import AccordionSection from '@/components/product/AccordionSection'
import AddToCartButton from '@/components/product/AddToCartButton'
import { useCartStore } from '@/store/cart.store'
import { CATEGORY_META, MOCK_PRODUCTS, MOCK_VENDORS, PRODUCT_VARIANTS } from '@/data/mock'
import {
  CATEGORY_ICON_MAP,
  DEFAULT_CATEGORY_ICON,
  BackIcon,
  WishlistIcon,
  StarIcon,
  AlertCircleIcon,
  DeliveryIcon,
  SparklesIcon,
  RefreshIcon,
  VerifiedIcon,
  type IconSvgElement,
} from '@/constants/icons'

const { width } = Dimensions.get('window')
const IMAGE_H = Math.round(width * 0.78)

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const product = MOCK_PRODUCTS.find(p => p._id === id)

  const addItem = useCartStore(s => s.addItem)
  const isInCart = useCartStore(s => s.isInCart)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState(false)

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <HugeiconsIcon icon={AlertCircleIcon} size={48} color='#D1D5DB' strokeWidth={1.5} />
          <Text style={styles.notFoundText}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const meta = CATEGORY_META[product.category] ?? { color: '#CE4002', icon: 'bag-outline', bg: '#FEF0E6' }
  const variants = PRODUCT_VARIANTS[product._id]
  const vendor = MOCK_VENDORS.find(v => v._id === product.vendorId)
  const stars = Math.min(5, Math.round(product.averageRating))
  const hasDiscount = !!product.discountPercentage && product.discountPercentage > 0

  const currentVariant = {
    size: selectedSize ?? undefined,
    color: selectedColor ?? undefined,
    colorHex: selectedColorHex ?? undefined,
  }
  const inCart = isInCart(product._id, currentVariant)

  function handleAdd() {
    if (!product) return
    addItem(product, currentVariant, quantity)
  }

  function handleDecrease() {
    setQuantity(q => Math.max(1, q - 1))
  }

  function handleIncrease() {
    setQuantity(q => q + 1)
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Image hero ── */}
        <View style={styles.imageWrap}>
          <LinearGradient
            colors={[meta.color + '30', meta.color + '10']}
            style={[styles.image, { height: IMAGE_H }]}
          >
            {/* large centre icon */}
            <View style={[styles.centerIcon, { backgroundColor: meta.color + '18' }]}>
              <HugeiconsIcon
                icon={CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON}
                size={88}
                color={meta.color}
                strokeWidth={1.5}
              />
            </View>

            {/* discount badge */}
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
              </View>
            )}
          </LinearGradient>

          {/* floating nav overlay */}
          <SafeAreaView style={styles.navOverlay} edges={['top']}>
            <View style={styles.navRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.8}>
                <HugeiconsIcon icon={BackIcon} size={20} color='#111827' strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWishlist(w => !w)}
                style={styles.navBtn}
                activeOpacity={0.8}
              >
                <HugeiconsIcon
                  icon={WishlistIcon}
                  size={20}
                  color={wishlist ? '#EF4444' : '#111827'}
                  strokeWidth={wishlist ? 2 : 1.5}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Content card ── */}
        <View style={styles.card}>

          {/* category + title */}
          <View style={styles.titleBlock}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryPill, { backgroundColor: meta.bg }]}>
                <Text style={[styles.categoryText, { color: meta.color }]}>{product.category}</Text>
              </View>
              {product.isNew && (
                <View style={styles.newPill}>
                  <Text style={styles.newText}>NEW</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{product.name}</Text>

            {/* rating row */}
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={14}
                    color={i < stars ? '#F59E0B' : '#D1D5DB'}
                    strokeWidth={1.5}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{product.averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({product.totalReviews.toLocaleString()} reviews)</Text>
            </View>
          </View>

          {/* price */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            )}
            {hasDiscount && (
              <View style={styles.savePill}>
                <Text style={styles.saveText}>Save ${(product.originalPrice! - product.price).toFixed(2)}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* ── Variants ── */}
          {variants?.colors && (
            <View style={styles.variantBlock}>
              <ColorSelector
                colors={variants.colors}
                selected={selectedColor}
                onSelect={c => { setSelectedColor(c.label); setSelectedColorHex(c.hex) }}
              />
            </View>
          )}

          {variants?.sizes && (
            <View style={styles.variantBlock}>
              <SizeSelector
                sizes={variants.sizes}
                selected={selectedSize}
                onSelect={setSelectedSize}
              />
            </View>
          )}

          {(variants?.colors || variants?.sizes) && <View style={styles.divider} />}

          {/* ── Seller info ── */}
          {vendor && (
            <View style={styles.sellerBlock}>
              <Text style={styles.sectionLabel}>Sold by</Text>
              <SellerInfoBlock
                vendor={vendor}
                onViewShop={() => vendor && router.push(`/vendor/${vendor._id}`)}
                onChat={() => {}}
              />
            </View>
          )}

          <View style={styles.divider} />

          {/* ── Accordions ── */}
          <View style={styles.accordions}>
            <AccordionSection title='Description' defaultOpen>
              <Text style={styles.descText}>{product.description}</Text>
              {product.stock <= 10 && (
                <View style={styles.stockWarning}>
                  <HugeiconsIcon icon={AlertCircleIcon} size={14} color='#D97706' strokeWidth={1.5} />
                  <Text style={styles.stockWarningText}>Only {product.stock} left in stock</Text>
                </View>
              )}
            </AccordionSection>

            <AccordionSection title='Delivery & Returns'>
              <View style={styles.deliveryGrid}>
                <DeliveryRow icon={DeliveryIcon} label='Standard' value='3–5 business days' />
                <DeliveryRow icon={SparklesIcon as unknown as IconSvgElement} label='Express' value='1–2 business days' />
                <DeliveryRow icon={RefreshIcon} label='Returns' value='30-day free returns' />
                <DeliveryRow icon={VerifiedIcon} label='Secure' value='Buyer protection included' />
              </View>
            </AccordionSection>

            <AccordionSection title={`Reviews (${product.totalReviews.toLocaleString()})`}>
              <View style={styles.reviewSummary}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNum}>{product.averageRating.toFixed(1)}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={16}
                        color={i < stars ? '#F59E0B' : '#D1D5DB'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingBigSub}>{product.totalReviews.toLocaleString()} ratings</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map(s => (
                    <RatingBar key={s} star={s} fill={s === stars ? 0.68 : s === stars - 1 ? 0.22 : 0.05} />
                  ))}
                </View>
              </View>
            </AccordionSection>
          </View>

          {/* bottom spacer for sticky button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart ── */}
      <AddToCartButton
        price={product.price}
        quantity={quantity}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        onAdd={handleAdd}
        inCart={inCart}
        outOfStock={product.stock === 0}
      />
    </View>
  )
}

function DeliveryRow({ icon, label, value }: { icon: IconSvgElement; label: string; value: string }) {
  return (
    <View style={styles.deliveryRow}>
      <View style={styles.deliveryIcon}>
        <HugeiconsIcon icon={icon} size={16} color='#CE4002' strokeWidth={1.5} />
      </View>
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryLabel}>{label}</Text>
        <Text style={styles.deliveryValue}>{value}</Text>
      </View>
    </View>
  )
}

function RatingBar({ star, fill }: { star: number; fill: number }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{star}</Text>
      <HugeiconsIcon icon={StarIcon} size={10} color='#F59E0B' strokeWidth={1.5} />
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${fill * 100}%` as any }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    paddingBottom: 0,
  },

  /* ── image ── */
  imageWrap: {
    position: 'relative',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    width: 160,
    height: 160,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },

  /* nav overlay */
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ── content card ── */
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 28,
    minHeight: 600,
  },

  /* title block */
  titleBlock: {
    marginBottom: 16,
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  newPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    lineHeight: 30,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  /* price */
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#10B981',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },

  /* variants */
  variantBlock: {
    marginBottom: 20,
  },

  /* seller */
  sellerBlock: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },

  /* accordions */
  accordions: {
    gap: 0,
  },
  descText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 22,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stockWarningText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#D97706',
  },

  /* delivery grid */
  deliveryGrid: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  deliveryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  deliveryValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 1,
  },

  /* review summary */
  reviewSummary: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingBig: {
    alignItems: 'center',
    gap: 4,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  ratingBigNum: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    lineHeight: 48,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingBigSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  ratingBars: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    width: 10,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },

  /* not found */
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#CE4002',
  },
})
