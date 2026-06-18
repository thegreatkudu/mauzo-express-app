import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useResponsive } from '@/hooks/useResponsive'

function SupplierSectionSkeleton() {
  return (
    <View style={styles.section}>

      {/* Supplier header */}
      <View style={styles.sectionHeader}>
        <SkeletonBox width={16} height={16} borderRadius={4} style={styles.shrink0} />
        <SkeletonBox height={14} width='48%' borderRadius={5} />
      </View>

      {/* Two item rows */}
      {[0, 1].map(i => (
        <View key={i} style={[styles.itemRow, i === 0 && styles.itemBorder]}>
          <View style={styles.itemInfo}>
            <SkeletonBox height={14} width='72%' borderRadius={5} />
            <SkeletonBox height={12} width='52%' borderRadius={4} style={{ marginTop: 4 }} />
            <SkeletonBox height={13} width='38%' borderRadius={4} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.itemActions}>
            <SkeletonBox width={32} height={32} borderRadius={8} />
            <SkeletonBox width={88} height={36} borderRadius={10} />
          </View>
        </View>
      ))}

      {/* Subtotal */}
      <View style={styles.subtotal}>
        <SkeletonBox height={13} width='28%' borderRadius={4} />
        <SkeletonBox height={14} width={92}  borderRadius={5} />
      </View>
    </View>
  )
}

export function CartSkeleton() {
  const { hp } = useResponsive()
  return (
    <View style={[styles.container, { paddingHorizontal: hp }]}>
      <SupplierSectionSkeleton />
      <SupplierSectionSkeleton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap:        12,
    paddingTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    overflow:        'hidden',
  },
  sectionHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    paddingHorizontal: 16,
    paddingVertical:  12,
    backgroundColor: '#FEF0E6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemRow: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical:  14,
    borderBottomColor: '#F9FAFB',
    gap:              12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemInfo:    { flex: 1 },
  itemActions: { alignItems: 'flex-end', gap: 10 },
  subtotal: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical:  12,
    backgroundColor: '#F9FAFB',
  },
  shrink0: { flexShrink: 0 },
})
