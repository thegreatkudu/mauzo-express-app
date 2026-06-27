import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useResponsive } from '@/hooks/useResponsive'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

export function OrderCardSkeleton() {
  const { isTablet } = useResponsive()
  const styles = useThemeStyles(getStyles)

  return (
    <View style={[styles.card, isTablet && styles.cardTablet]}>
      <View style={styles.spaceRow}>
        <SkeletonBox height={14} width='44%' borderRadius={6} />
        <SkeletonBox height={24} width={80} borderRadius={12} />
      </View>
      <View style={styles.iconRow}>
        <SkeletonBox width={13} height={13} borderRadius={4} style={styles.shrink0} />
        <SkeletonBox height={12} width='52%' borderRadius={5} />
      </View>
      <SkeletonBox height={13} width='68%' borderRadius={5} />
      <View style={[styles.spaceRow, { marginTop: 2 }]}>
        <SkeletonBox height={11} width={88} borderRadius={4} />
        <SkeletonBox height={13} width={88} borderRadius={5} />
      </View>
    </View>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      padding:         16,
      marginBottom:    10,
      borderWidth:     1,
      borderColor:     theme.colors.divider,
      gap:             8,
    },
    cardTablet: {
      marginBottom: 0,
      borderRadius: 18,
      padding:      18,
    },
    spaceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
    shrink0:  { flexShrink: 0 },
  })
}
