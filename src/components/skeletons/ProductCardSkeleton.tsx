import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  const styles = useThemeStyles(getStyles)
  const imgH   = compact ? 120 : 150

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <SkeletonBox height={imgH} borderRadius={0} />
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <SkeletonBox height={13} width='78%' borderRadius={5} />
        {!compact && (
          <SkeletonBox height={11} width='60%' borderRadius={4} style={{ marginTop: 5 }} />
        )}
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

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius:    14,
      marginBottom:    12,
      overflow:        'hidden',
      borderWidth:     1,
      borderColor:     theme.colors.divider,
    },
    cardCompact:  { borderRadius: 12, marginBottom: 0 },
    body:         { padding: 12 },
    bodyCompact:  { padding: 8, paddingHorizontal: 10 },
    footer:       { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
    priceCol:     { flex: 1, gap: 3 },
    shrink0:      { flexShrink: 0 },
  })
}
