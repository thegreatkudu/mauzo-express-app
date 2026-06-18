import { StyleSheet, Text, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { VendorStore } from '@/types'
import { LocationIcon, ClockIcon, VerifiedIcon } from '@/constants/icons'
import { Calendar01Icon } from '@hugeicons/core-free-icons'

interface Props {
  vendor: VendorStore
}

export default function VendorInfoStrip({ vendor }: Props) {
  const joined = new Date(vendor.joinedDate).getFullYear()

  const items = [
    { icon: LocationIcon, label: vendor.location },
    { icon: ClockIcon,    label: vendor.deliveryEstimate },
    { icon: Calendar01Icon as any, label: `Since ${joined}` },
  ]

  return (
    <View style={styles.strip}>
      {items.map((item, i) => (
        <View key={i} style={[styles.item, i < items.length - 1 && styles.itemBorder]}>
          <HugeiconsIcon icon={item.icon} size={13} color='#9CA3AF' strokeWidth={1.5} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
      {vendor.isVerified && (
        <View style={[styles.item, styles.itemBorder, { borderLeftWidth: 1, borderLeftColor: '#F3F4F6' }]}>
          <HugeiconsIcon icon={VerifiedIcon} size={13} color={vendor.color} strokeWidth={1.5} />
          <Text style={[styles.label, { color: vendor.color }]}>Verified</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  itemBorder: {
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  label: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
})
