import { StyleSheet, Text, View } from 'react-native'
import { VendorStore } from '@/types'

interface Props {
  vendor: VendorStore
}

export default function VendorStatsRow({ vendor }: Props) {
  const followers = vendor.followers >= 1000
    ? `${(vendor.followers / 1000).toFixed(1)}k`
    : String(vendor.followers)

  const stats = [
    { label: 'Rating',    value: vendor.rating.toFixed(1) },
    { label: 'Followers', value: followers },
    { label: 'Products',  value: String(vendor.productCount) },
    { label: 'Reviews',   value: vendor.reviewCount >= 1000 ? `${(vendor.reviewCount / 1000).toFixed(1)}k` : String(vendor.reviewCount) },
  ]

  return (
    <View style={styles.row}>
      {stats.map((stat, i) => (
        <View key={stat.label} style={[styles.stat, i < stats.length - 1 && styles.statBorder]}>
          <Text style={[styles.value, { color: vendor.color }]}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  value: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  label: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
})
