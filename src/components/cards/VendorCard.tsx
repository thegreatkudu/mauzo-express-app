// Snapcart "Latest Articles" → adapted as Vendor card.
//
// Snapcart article cards have:
//   · 16:9 image header with rounded-top corners
//   · Category pill badge overlaid on image
//   · Date label
//   · Bold article title
//   · Short excerpt (2 lines)
//   · "Read More" button
//
// Adapted for vendors:
//   · Gradient cover (16:9) with centred icon avatar
//   · Category pill + Verified badge overlay
//   · Vendor name + tagline
//   · Rating · Reviews · Followers stats row
//   · Delivery time chip
//   · "Visit Store" outlined CTA

import { memo, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { Vendor } from '@/types'
import {
  CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON,
  StarIcon, ClockIcon, VerifiedIcon, FollowersIcon,
} from '@/constants/icons'
import { C, F, R, S, TS, shadowStyles } from '@/theme'

interface Props {
  vendor: Vendor
  onPress?: () => void
  /** 'card' = vertical article-card, 'row' = compact horizontal */
  variant?: 'card' | 'row'
  deliveryTime?: string
}

// Demo delivery times keyed by vendor id
const DELIVERY_MAP: Record<string, string> = {
  v1: '30–45 min', v2: '45–60 min', v3: '1–2 days', v4: '30–50 min',
}

function VendorCard({ vendor, onPress, variant = 'card', deliveryTime }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const vendorIcon = CATEGORY_ICON_MAP[vendor.icon] ?? DEFAULT_CATEGORY_ICON
  const delivery   = deliveryTime ?? DELIVERY_MAP[vendor._id] ?? '40–55 min'
  const followersF = vendor.followers >= 1000
    ? `${(vendor.followers / 1000).toFixed(1)}k`
    : String(vendor.followers)

  function pressIn()  { Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start() }
  function pressOut() { Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start() }

  function navigate() {
    router.push(`/vendor/${vendor._id}`)
    onPress?.()
  }

  /* ── Compact horizontal row variant ──────────────────────────────────── */
  if (variant === 'row') {
    return (
      <TouchableOpacity onPress={navigate} activeOpacity={0.88} style={[styles.rowCard, shadowStyles.product]}>
        {/* icon circle */}
        <View style={[styles.rowAvatar, { backgroundColor: vendor.color }]}>
          <HugeiconsIcon icon={vendorIcon} size={22} color='#fff' strokeWidth={1.5} />
          {vendor.isVerified && <View style={styles.rowVerifiedDot} />}
        </View>
        {/* info */}
        <View style={styles.rowInfo}>
          <View style={styles.rowNameRow}>
            <Text style={styles.rowName} numberOfLines={1}>{vendor.name}</Text>
            {vendor.isVerified && (
              <HugeiconsIcon icon={VerifiedIcon} size={11} color={vendor.color} strokeWidth={2} />
            )}
          </View>
          <Text style={styles.rowTagline} numberOfLines={1}>{vendor.tagline}</Text>
          <View style={styles.rowStats}>
            <HugeiconsIcon icon={StarIcon} size={10} color={C.star} strokeWidth={2} />
            <Text style={styles.rowStatText}>{vendor.rating}</Text>
            <View style={styles.dot} />
            <Text style={styles.rowStatText}>{followersF} followers</Text>
          </View>
        </View>
        {/* delivery pill */}
        <View style={styles.rowDelivery}>
          <HugeiconsIcon icon={ClockIcon} size={10} color={C.textMuted} strokeWidth={1.5} />
          <Text style={styles.rowDeliveryText}>{delivery}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  /* ── Article-card vertical variant ───────────────────────────────────── */
  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }, shadowStyles.product]}>
      <TouchableOpacity
        onPress={navigate}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={styles.cardInner}
      >
        {/* ── Cover header (Snapcart article image area) ──────────────── */}
        <View style={styles.coverWrap}>
          <LinearGradient
            colors={[vendor.color + '88', vendor.color + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          >
            {/* decorative blobs */}
            <View style={[styles.blob1, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <View style={[styles.blob2, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

            {/* Snapcart: category pill overlay top-left */}
            <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
              <Text style={styles.catBadgeText}>{vendor.category.toUpperCase()}</Text>
            </View>

            {/* Snapcart: date-like label top-right → replaced with verified badge */}
            {vendor.isVerified && (
              <View style={styles.verifiedBadge}>
                <HugeiconsIcon icon={VerifiedIcon} size={10} color='#fff' strokeWidth={2} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}

            {/* centred vendor icon — like article featured image */}
            <View style={styles.iconOuter}>
              <View style={[styles.iconInner, { backgroundColor: vendor.color }]}>
                <HugeiconsIcon icon={vendorIcon} size={24} color='#fff' strokeWidth={1.5} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Body (Snapcart article body) ────────────────────────────── */}
        <View style={styles.body}>
          {/* name — replaces article title */}
          <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>

          {/* tagline — replaces article excerpt */}
          <Text style={styles.tagline} numberOfLines={2}>{vendor.tagline}</Text>

          {/* stats row — replaces article date/author */}
          <View style={styles.statsRow}>
            {/* rating pill */}
            <View style={[styles.ratingPill, { backgroundColor: C.star + '18' }]}>
              <HugeiconsIcon icon={StarIcon} size={10} color={C.star} strokeWidth={2} />
              <Text style={styles.ratingVal}>{vendor.rating}</Text>
            </View>

            <View style={styles.dot} />

            {/* delivery */}
            <View style={styles.statItem}>
              <HugeiconsIcon icon={ClockIcon} size={10} color={C.textMuted} strokeWidth={1.5} />
              <Text style={styles.statText}>{delivery}</Text>
            </View>

            <View style={styles.dot} />

            {/* followers */}
            <View style={styles.statItem}>
              <HugeiconsIcon icon={FollowersIcon} size={10} color={C.textMuted} strokeWidth={1.5} />
              <Text style={styles.statText}>{followersF}</Text>
            </View>
          </View>

          {/* Snapcart "Read More" → "Visit Store" */}
          <TouchableOpacity
            onPress={navigate}
            style={[styles.visitBtn, { borderColor: vendor.color }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.visitText, { color: vendor.color }]}>Visit Store</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default memo(VendorCard)

const styles = StyleSheet.create({
  /* ── Vertical card ─────────────────────────────────────────────────────── */
  card: {
    width: 200,
    backgroundColor: C.surface,
    borderRadius: R.md,
    overflow: 'hidden',
  },
  cardInner: { flex: 1 },

  /* cover — Snapcart uses a 16:9 image header */
  coverWrap: { overflow: 'hidden', borderTopLeftRadius: R.md, borderTopRightRadius: R.md },
  cover: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blob1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    right: -25,
  },
  blob2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: -20,
    left: 60,
  },

  /* Snapcart category pill top-left of cover */
  catBadge: {
    position: 'absolute',
    top: S.sm,
    left: S.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  catBadgeText: {
    color: '#fff',
    fontSize: TS.xs,
    fontFamily: F.bold,
    letterSpacing: 0.4,
  },

  /* Snapcart date badge top-right → verified badge */
  verifiedBadge: {
    position: 'absolute',
    top: S.sm,
    right: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  verifiedText: {
    color: '#fff',
    fontSize: TS.xs,
    fontFamily: F.bold,
  },

  /* centred icon avatar */
  iconOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* body */
  body: {
    padding: S.md,
    gap: S.xs,
  },
  vendorName: {
    fontSize: TS.lg,
    fontFamily: F.bold,
    color: C.text,
    letterSpacing: -0.1,
  },
  tagline: {
    fontSize: TS.base,
    fontFamily: F.regular,
    color: C.textSub,
    lineHeight: 17,
  },

  /* stats row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.full,
  },
  ratingVal: {
    fontSize: TS.xs,
    fontFamily: F.bold,
    color: '#D97706',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: TS.xs,
    fontFamily: F.regular,
    color: C.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.border,
  },

  /* Snapcart "Visit Store" button — mirrors "Read More" style */
  visitBtn: {
    marginTop: S.sm,
    borderWidth: 1.5,
    borderRadius: R.sm,
    paddingVertical: 7,
    alignItems: 'center',
  },
  visitText: {
    fontSize: TS.base,
    fontFamily: F.semiBold,
  },

  /* ── Compact row variant ────────────────────────────────────────────────── */
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.sm,
    padding: S.md,
    marginBottom: S.sm,
    gap: S.md,
  },
  rowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  rowVerifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.surface,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowName: {
    fontSize: TS.lg,
    fontFamily: F.semiBold,
    color: C.text,
  },
  rowTagline: {
    fontSize: TS.base,
    fontFamily: F.regular,
    color: C.textMuted,
  },
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  rowStatText: {
    fontSize: TS.xs,
    fontFamily: F.regular,
    color: C.textSub,
  },
  rowDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.full,
    flexShrink: 0,
  },
  rowDeliveryText: {
    fontSize: TS.xs,
    fontFamily: F.medium,
    color: C.textSub,
  },
})
