import { ScrollView, StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'

export function OrderDetailSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {/* ── Hero card ── */}
      <View style={styles.heroCard}>
        {/* Band */}
        <View style={styles.heroBand}>
          <View style={styles.heroBandLeft}>
            <SkeletonBox height={18} width='48%' borderRadius={6} />
            <SkeletonBox height={12} width='32%' borderRadius={4} style={{ marginTop: 6 }} />
          </View>
          <SkeletonBox height={26} width={90} borderRadius={13} />
        </View>
        {/* Body */}
        <View style={styles.heroBody}>
          <View style={styles.iconRow}>
            <SkeletonBox width={14} height={14} borderRadius={4} style={styles.shrink0} />
            <SkeletonBox height={13} width='52%' borderRadius={5} />
          </View>
          <View style={styles.iconRow}>
            <SkeletonBox width={14} height={14} borderRadius={4} style={styles.shrink0} />
            <SkeletonBox height={13} width='24%' borderRadius={5} />
          </View>
        </View>
      </View>

      {/* ── Supplier card ── */}
      <View style={styles.supplierCard}>
        <SkeletonBox width={46} height={46} borderRadius={14} style={styles.shrink0} />
        <View style={styles.supplierInfo}>
          <SkeletonBox height={14} width='58%' borderRadius={5} />
          <SkeletonBox height={11} width='44%' borderRadius={4} style={{ marginTop: 5 }} />
        </View>
        <SkeletonBox width={16} height={16} borderRadius={4} style={styles.shrink0} />
      </View>

      {/* ── Timeline card ── */}
      <View style={[styles.card, { gap: 0 }]}>
        <SkeletonBox height={15} width='36%' borderRadius={6} style={{ marginBottom: 14 }} />
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={styles.timelineStep}>
            <View style={styles.timelineLeft}>
              <SkeletonBox width={28} height={28} borderRadius={14} style={styles.shrink0} />
              {i < 4 && (
                <SkeletonBox width={2} height={24} borderRadius={1} style={{ marginTop: 3 }} />
              )}
            </View>
            <SkeletonBox height={13} width='44%' borderRadius={5} style={{ marginTop: 7 }} />
          </View>
        ))}
      </View>

      {/* ── Items card ── */}
      <View style={[styles.card, { gap: 0 }]}>
        <SkeletonBox height={15} width='34%' borderRadius={6} style={{ marginBottom: 10 }} />
        {[0, 1, 2].map((_, i) => (
          <View key={i} style={[styles.itemRow, i < 2 && styles.itemBorder]}>
            <SkeletonBox width={40} height={40} borderRadius={12} style={styles.shrink0} />
            <View style={styles.itemLeft}>
              <SkeletonBox height={13} width='68%' borderRadius={5} />
              <SkeletonBox height={11} width='46%' borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.itemRight}>
              <SkeletonBox height={13} width={62} borderRadius={5} />
              <SkeletonBox height={20} width={58} borderRadius={10} style={{ marginTop: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingVertical:   16,
    gap:               14,
    paddingBottom:     40,
  },

  // Hero
  heroCard: {
    backgroundColor: '#fff',
    borderRadius:    18,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     '#F0F0F0',
  },
  heroBand: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   '#F0F0F0',
    paddingHorizontal: 18,
    paddingVertical:   16,
  },
  heroBandLeft: { flex: 1, marginRight: 12 },
  heroBody: {
    paddingHorizontal: 18,
    paddingVertical:   14,
    gap:               10,
  },

  // Supplier
  supplierCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F0F0F0',
  },
  supplierInfo: { flex: 1, gap: 0 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#F0F0F0',
    gap:             10,
  },

  // Timeline
  timelineStep: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           14,
    minHeight:     52,
  },
  timelineLeft: {
    alignItems: 'center',
    width:      28,
    gap:        3,
  },

  // Items
  iconRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  itemRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 12,
    gap:             10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemLeft:  { flex: 1, gap: 0 },
  itemRight: { alignItems: 'flex-end', gap: 0 },

  shrink0: { flexShrink: 0 },
})
