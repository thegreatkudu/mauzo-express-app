import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function NotificationRowSkeleton() {
  return (
    <View style={styles.row}>

      {/* Icon circle */}
      <SkeletonBox width={40} height={40} borderRadius={12} style={styles.shrink0} />

      {/* Message lines + timestamp */}
      <View style={styles.content}>
        <SkeletonBox height={13} width='86%' borderRadius={5} />
        <SkeletonBox height={13} width='62%' borderRadius={5} style={{ marginTop: 5 }} />
        <SkeletonBox height={11} width={52}  borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             12,
    backgroundColor: '#fff',
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    marginBottom:    8,
  },
  content: { flex: 1 },
  shrink0: { flexShrink: 0 },
})
