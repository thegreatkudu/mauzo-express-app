import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useResponsive } from '@/hooks/useResponsive'

export function SupplierCardSkeleton({ compact = false }: { compact?: boolean }) {
  const { isTablet } = useResponsive()
  const p           = compact ? 12 : 16
  const avatarSize  = compact ? 36 : 44
  const avatarR     = compact ? 10 : 12
  const mb          = compact ? 0 : 12

  return (
    <View style={[styles.card, { padding: p, marginBottom: mb }]}>

      {/* Header row: avatar + name / location */}
      <View style={[styles.headerRow, { gap: compact ? 8 : 12, marginBottom: compact ? 10 : 12 }]}>
        <SkeletonBox width={avatarSize} height={avatarSize} borderRadius={avatarR} style={styles.shrink0} />
        <View style={styles.headerText}>
          <SkeletonBox height={15} width='62%' borderRadius={6} />
          <View style={[styles.locRow, { marginTop: 6 }]}>
            <SkeletonBox width={12} height={12} borderRadius={3} style={styles.shrink0} />
            <SkeletonBox height={11} width='44%' borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Meta row: category chip + product count */}
      <View style={[styles.metaRow, { marginBottom: compact ? 10 : 12 }]}>
        <SkeletonBox height={24} width={90} borderRadius={20} />
        <View style={styles.locRow}>
          <SkeletonBox width={12} height={12} borderRadius={3} style={styles.shrink0} />
          <SkeletonBox height={11} width={58} borderRadius={4} />
        </View>
      </View>

      {/* Browse button */}
      <SkeletonBox height={compact ? 36 : 40} borderRadius={12} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  headerText: { flex: 1 },
  locRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  metaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  shrink0: { flexShrink: 0 },
})
