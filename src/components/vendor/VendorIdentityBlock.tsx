import { StyleSheet, Text, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { VendorStore } from '@/types'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, TickIcon } from '@/constants/icons'

interface Props {
  vendor: VendorStore
}

const LOGO_SIZE = 76

export default function VendorIdentityBlock({ vendor }: Props) {
  return (
    <View style={styles.container}>
      {/* logo — overlaps the header */}
      <View style={[styles.logoRing, { borderColor: vendor.color + '50' }]}>
        <View style={[styles.logo, { backgroundColor: vendor.color }]}>
          <HugeiconsIcon
            icon={CATEGORY_ICON_MAP[vendor.icon] ?? DEFAULT_CATEGORY_ICON}
            size={32}
            color='#fff'
            strokeWidth={1.5}
          />
        </View>
        {vendor.isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: vendor.color }]}>
            <HugeiconsIcon icon={TickIcon} size={10} color='#fff' strokeWidth={2} />
          </View>
        )}
      </View>

      {/* name + handle */}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{vendor.name}</Text>
      </View>
      <Text style={[styles.handle, { color: vendor.color }]}>{vendor.handle}</Text>

      {/* bio */}
      <Text style={styles.bio}>{vendor.bio}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logoRing: {
    width: LOGO_SIZE + 8,
    height: LOGO_SIZE + 8,
    borderRadius: (LOGO_SIZE + 8) / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: -(LOGO_SIZE / 2 + 4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  handle: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
    marginBottom: 10,
  },
  bio: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
})
