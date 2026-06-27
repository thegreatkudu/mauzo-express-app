import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

export function SupplierCardSkeleton({ compact = false }: { compact?: boolean }) {
  const styles = useThemeStyles(getStyles)
  const bandH  = compact ? 90 : 110

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <SkeletonBox height={bandH} borderRadius={0} />
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <SkeletonBox height={13} width='70%' borderRadius={5} />
        <View style={[styles.locRow, { marginTop: compact ? 5 : 6 }]}>
          <SkeletonBox width={12} height={12} borderRadius={3} style={styles.shrink0} />
          <SkeletonBox height={11} width='48%' borderRadius={4} />
        </View>
        <SkeletonBox
          height={compact ? 32 : 36}
          borderRadius={10}
          style={{ marginTop: compact ? 6 : 8 }}
        />
      </View>
    </View>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      marginBottom:    12,
      overflow:        'hidden',
      borderWidth:     1,
      borderColor:     theme.colors.divider,
    },
    cardCompact: { marginBottom: 0 },
    body:        { padding: 12 },
    bodyCompact: { padding: 10 },
    locRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
    shrink0:     { flexShrink: 0 },
  })
}
