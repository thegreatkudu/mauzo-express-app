import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function SupplierCardSkeleton({ compact = false }: { compact?: boolean }) {
  const bandH = compact ? 90 : 110

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>

      {/* Colour band */}
      <SkeletonBox height={bandH} borderRadius={0} />

      {/* Body */}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        {/* Business name */}
        <SkeletonBox height={13} width='70%' borderRadius={5} />

        {/* Location row */}
        <View style={[styles.locRow, { marginTop: compact ? 5 : 6 }]}>
          <SkeletonBox width={12} height={12} borderRadius={3} style={styles.shrink0} />
          <SkeletonBox height={11} width='48%' borderRadius={4} />
        </View>

        {/* CTA button */}
        <SkeletonBox
          height={compact ? 32 : 36}
          borderRadius={10}
          style={{ marginTop: compact ? 6 : 8 }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    marginBottom:    12,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     '#F3F4F6',
  },
  cardCompact: {
    marginBottom: 0,
  },
  body: {
    padding: 12,
  },
  bodyCompact: {
    padding: 10,
  },
  locRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  shrink0: { flexShrink: 0 },
})
