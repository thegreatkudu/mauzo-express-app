import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

function PlanCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={14} width='70%' borderRadius={5} />
      <SkeletonBox height={12} width='54%' borderRadius={4} style={{ marginTop: 4 }} />
      <SkeletonBox height={15} width='80%' borderRadius={5} style={{ marginTop: 8 }} />
    </View>
  )
}

export function SubscriptionSkeleton() {
  return (
    <View style={styles.grid}>
      <PlanCardSkeleton />
      <PlanCardSkeleton />
      <PlanCardSkeleton />
      <PlanCardSkeleton />
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
    marginTop:     4,
  },
  card: {
    width:           '47.5%',
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     2,
    borderColor:     '#E5E7EB',
    gap:             4,
  },
})
