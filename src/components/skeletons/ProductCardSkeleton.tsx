import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  const imgH = compact ? 120 : 150

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>

      {/* Image */}
      <SkeletonBox height={imgH} borderRadius={0} />

      {/* Body */}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        {/* Product name */}
        <SkeletonBox height={13} width='78%' borderRadius={5} />

        {/* Description (list mode only) */}
        {!compact && (
          <SkeletonBox height={11} width='60%' borderRadius={4} style={{ marginTop: 5 }} />
        )}

        {/* Footer: price block + action */}
        <View style={[styles.footer, { marginTop: compact ? 8 : 10 }]}>
          <View style={styles.priceCol}>
            <SkeletonBox height={compact ? 13 : 15} width='75%' borderRadius={5} />
            <SkeletonBox height={10} width='55%' borderRadius={4} style={{ marginTop: 3 }} />
          </View>
          {compact ? (
            <SkeletonBox width={34} height={34} borderRadius={17} style={styles.shrink0} />
          ) : (
            <SkeletonBox width={88} height={36} borderRadius={10} style={styles.shrink0} />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    14,
    marginBottom:    12,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     '#F3F4F6',
  },
  cardCompact: {
    borderRadius: 12,
    marginBottom: 0,
  },
  body: {
    padding: 12,
  },
  bodyCompact: {
    padding:          8,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
    gap:            8,
  },
  priceCol: {
    flex: 1,
    gap:  3,
  },
  shrink0: { flexShrink: 0 },
})
