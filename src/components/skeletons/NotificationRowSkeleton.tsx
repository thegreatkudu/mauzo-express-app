import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function NotificationRowSkeleton() {
  return (
    <View style={styles.row}>
      {/* Icon circle */}
      <SkeletonBox width={46} height={46} borderRadius={14} style={styles.shrink0} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title row + time */}
        <View style={styles.titleRow}>
          <SkeletonBox height={13} width='55%' borderRadius={5} />
          <SkeletonBox height={11} width={40}  borderRadius={4} />
        </View>
        {/* Type badge */}
        <SkeletonBox height={20} width={72} borderRadius={20} style={{ marginTop: 5 }} />
        {/* Message lines */}
        <SkeletonBox height={12} width='90%' borderRadius={4} style={{ marginTop: 7 }} />
        <SkeletonBox height={12} width='68%' borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             13,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    14,
    borderWidth:     1,
    borderLeftWidth: 3,
    borderColor:     '#F0F0F0',
    borderLeftColor: '#F0F0F0',
  },
  content:  { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  shrink0:  { flexShrink: 0 },
})
