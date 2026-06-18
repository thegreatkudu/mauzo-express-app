import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, FONT, SPACING } from '@/constants/theme'

interface Props {
  title: string
  subtitle?: string
  onSeeAll?: () => void
  accent?: boolean
}

export default function SectionHeader({ title, subtitle, onSeeAll, accent = false }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          {accent && <View style={styles.accentBar} />}
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={10}
          activeOpacity={0.7}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.page,
    marginBottom: 14,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#111827',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  seeAllBtn: {
    paddingLeft: 12,
    paddingVertical: 2,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: FONT.semiBold,
    color: COLORS.primary,
  },
})
