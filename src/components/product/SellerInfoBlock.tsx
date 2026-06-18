import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Vendor } from '@/types'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, TickIcon, StarIcon, ChatIcon } from '@/constants/icons'

interface Props {
  vendor: Vendor
  onViewShop?: () => void
  onChat?: () => void
}

export default function SellerInfoBlock({ vendor, onViewShop, onChat }: Props) {
  const followers = vendor.followers >= 1000
    ? `${(vendor.followers / 1000).toFixed(1)}k`
    : String(vendor.followers)

  return (
    <View style={styles.card}>
      {/* left: icon + info */}
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: vendor.color + '20' }]}>
          <HugeiconsIcon
            icon={CATEGORY_ICON_MAP[vendor.icon] ?? DEFAULT_CATEGORY_ICON}
            size={22}
            color={vendor.color}
            strokeWidth={1.5}
          />
          {vendor.isVerified && (
            <View style={[styles.verifiedDot, { backgroundColor: vendor.color }]}>
              <HugeiconsIcon icon={TickIcon} size={8} color='#fff' strokeWidth={2} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{vendor.name}</Text>
          </View>
          <Text style={styles.tagline} numberOfLines={1}>{vendor.tagline}</Text>
          <View style={styles.statsRow}>
            <HugeiconsIcon icon={StarIcon} size={11} color='#F59E0B' strokeWidth={1.5} />
            <Text style={styles.statsText}>{vendor.rating} · {followers} followers</Text>
          </View>
        </View>
      </View>

      {/* right: actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onChat}
          style={[styles.actionBtn, styles.chatBtn]}
          activeOpacity={0.8}
          hitSlop={4}
        >
          <HugeiconsIcon icon={ChatIcon} size={16} color='#CE4002' strokeWidth={1.5} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onViewShop}
          style={[styles.actionBtn, styles.shopBtn]}
          activeOpacity={0.8}
          hitSlop={4}
        >
          <Text style={styles.shopBtnText}>Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  tagline: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    width: 36,
    backgroundColor: '#FEF0E6',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  shopBtn: {
    paddingHorizontal: 14,
    backgroundColor: '#CE4002',
  },
  shopBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
})
