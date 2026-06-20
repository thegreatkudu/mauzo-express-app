import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useResponsive } from '@/hooks/useResponsive'

export function OrderCardSkeleton() {
  const { isTablet } = useResponsive()

  return (
    <View style={[styles.card, isTablet && styles.cardTablet]}>

      {/* Row 1: order ID + status badge */}
      <View style={styles.spaceRow}>
        <SkeletonBox height={14} width='44%' borderRadius={6} />
        <SkeletonBox height={24} width={80} borderRadius={12} />
      </View>

      {/* Row 2: building icon + supplier */}
      <View style={styles.iconRow}>
        <SkeletonBox width={13} height={13} borderRadius={4} style={styles.shrink0} />
        <SkeletonBox height={12} width='52%' borderRadius={5} />
      </View>

      {/* Row 3: product summary */}
      <SkeletonBox height={13} width='68%' borderRadius={5} />

      {/* Row 4: date (left) + total (right) */}
      <View style={[styles.spaceRow, { marginTop: 2 }]}>
        <SkeletonBox height={11} width={88} borderRadius={4} />
        <SkeletonBox height={13} width={88} borderRadius={5} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     '#F0F0F0',
    gap:             8,
  },
  cardTablet: {
    marginBottom: 0,
    borderRadius: 18,
    padding:      18,
  },
  spaceRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  shrink0: { flexShrink: 0 },
})
