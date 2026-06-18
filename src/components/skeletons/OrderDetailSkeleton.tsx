import { ScrollView, StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function OrderDetailSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >

      {/* ── Order Info card ── */}
      <View style={styles.card}>
        {/* Order ID + status badge */}
        <View style={styles.spaceRow}>
          <SkeletonBox height={16} width='40%' borderRadius={6} />
          <SkeletonBox height={26} width={80} borderRadius={13} />
        </View>
        {/* Date row */}
        <View style={styles.iconRow}>
          <SkeletonBox width={14} height={14} borderRadius={4} style={styles.shrink0} />
          <SkeletonBox height={13} width='55%' borderRadius={5} />
        </View>
        {/* Supplier row */}
        <View style={styles.iconRow}>
          <SkeletonBox width={14} height={14} borderRadius={4} style={styles.shrink0} />
          <SkeletonBox height={13} width='44%' borderRadius={5} />
        </View>
        {/* Total row */}
        <View style={[styles.spaceRow, styles.totalRow]}>
          <SkeletonBox height={14} width='38%' borderRadius={5} />
          <SkeletonBox height={16} width={90}  borderRadius={5} />
        </View>
      </View>

      {/* ── Timeline card ── */}
      <View style={[styles.card, { gap: 0 }]}>
        <SkeletonBox height={15} width='36%' borderRadius={6} style={{ marginBottom: 16 }} />
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={styles.timelineStep}>
            <View style={styles.timelineLeft}>
              <SkeletonBox width={24} height={24} borderRadius={12} style={styles.shrink0} />
              {i < 4 && (
                <SkeletonBox width={2} height={24} borderRadius={1} style={{ marginTop: 2 }} />
              )}
            </View>
            <SkeletonBox height={13} width='46%' borderRadius={5} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* ── Items & Quotations card ── */}
      <View style={[styles.card, { gap: 0 }]}>
        <SkeletonBox height={15} width='34%' borderRadius={6} style={{ marginBottom: 14 }} />
        {[0, 1, 2].map((_, i) => (
          <View key={i} style={[styles.itemRow, i < 2 && styles.itemBorder]}>
            <View style={styles.itemLeft}>
              <SkeletonBox height={14} width='70%' borderRadius={5} />
              <SkeletonBox height={12} width='50%' borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.itemRight}>
              <SkeletonBox height={14} width={62} borderRadius={5} />
              <SkeletonBox height={11} width={44} borderRadius={4} style={{ marginTop: 3 }} />
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    padding:       16,
    gap:           14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
    gap:             10,
  },

  spaceRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  totalRow: {
    paddingTop:      10,
    borderTopWidth:  1,
    borderTopColor:  '#F3F4F6',
    marginTop:       4,
  },

  // Timeline
  timelineStep: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           14,
    minHeight:     48,
  },
  timelineLeft: {
    alignItems: 'center',
    width:      24,
    gap:        2,
  },

  // Items
  itemRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap:             8,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemLeft:  { flex: 1 },
  itemRight: { alignItems: 'flex-end', gap: 3 },

  shrink0: { flexShrink: 0 },
})
