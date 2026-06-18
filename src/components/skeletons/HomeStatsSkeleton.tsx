import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useResponsive } from '@/hooks/useResponsive'

export function HomeStatsSkeleton() {
  const { gap } = useResponsive()

  return (
    <View style={[styles.row, { gap, marginTop: 12 }]}>
      {[0, 1, 2].map(i => (
        <View key={i} style={styles.card}>
          <SkeletonBox height={28} width='46%' borderRadius={6} />
          <SkeletonBox height={11} width='72%' borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  )
}

export function HomeActionsSkeleton() {
  const { gap } = useResponsive()

  return (
    <View style={[styles.actionsGrid, { gap, marginTop: 12 }]}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={styles.actionCard}>
          <SkeletonBox width={44} height={44} borderRadius={12} />
          <SkeletonBox height={13} width='68%' borderRadius={5} style={{ marginTop: 10 }} />
          <SkeletonBox height={11} width='52%' borderRadius={4} style={{ marginTop: 5 }} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  card: {
    flex:             1,
    backgroundColor:  '#fff',
    borderRadius:     14,
    padding:          14,
    borderTopWidth:   3,
    borderWidth:      1,
    borderColor:      '#F3F4F6',
    borderTopColor:   '#E8EAED',
    alignItems:       'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  actionCard: {
    width:           '47.5%',
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
  },
})
