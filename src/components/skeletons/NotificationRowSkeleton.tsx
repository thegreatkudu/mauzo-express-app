import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

export function NotificationRowSkeleton() {
  const styles = useThemeStyles(getStyles)

  return (
    <View style={styles.row}>
      <SkeletonBox width={46} height={46} borderRadius={14} style={styles.shrink0} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <SkeletonBox height={13} width='55%' borderRadius={5} />
          <SkeletonBox height={11} width={40}  borderRadius={4} />
        </View>
        <SkeletonBox height={20} width={72} borderRadius={20} style={{ marginTop: 5 }} />
        <SkeletonBox height={12} width='90%' borderRadius={4} style={{ marginTop: 7 }} />
        <SkeletonBox height={12} width='68%' borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection:   'row',
      alignItems:      'flex-start',
      gap:             13,
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      padding:         16,
      marginBottom:    14,
      borderWidth:     1,
      borderLeftWidth: 3,
      borderColor:     theme.colors.divider,
      borderLeftColor: theme.colors.divider,
    },
    content:  { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    shrink0:  { flexShrink: 0 },
  })
}
