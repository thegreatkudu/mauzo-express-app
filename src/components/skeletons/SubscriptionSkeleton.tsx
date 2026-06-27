import { StyleSheet, View } from 'react-native'
import { SkeletonBox } from './Shimmer'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

function PlanCardSkeleton() {
  const styles = useThemeStyles(getStyles)
  return (
    <View style={styles.card}>
      <SkeletonBox height={14} width='70%' borderRadius={5} />
      <SkeletonBox height={12} width='54%' borderRadius={4} style={{ marginTop: 4 }} />
      <SkeletonBox height={15} width='80%' borderRadius={5} style={{ marginTop: 8 }} />
    </View>
  )
}

export function SubscriptionSkeleton() {
  const styles = useThemeStyles(getStyles)
  return (
    <View style={styles.grid}>
      <PlanCardSkeleton />
      <PlanCardSkeleton />
      <PlanCardSkeleton />
      <PlanCardSkeleton />
    </View>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    card: {
      width:           '47.5%',
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      padding:         16,
      borderWidth:     2,
      borderColor:     theme.colors.inputBorder,
      gap:             4,
    },
  })
}
