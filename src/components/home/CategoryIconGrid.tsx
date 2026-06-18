import { memo } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Category } from '@/types'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON } from '@/constants/icons'
import { COLORS, FONT, RADIUS, SPACING } from '@/constants/theme'
import { shadowStyles } from '@/theme'

interface Props {
  categories: Category[]
  onSelect?: (category: Category) => void
  selected?: string
}

function CategoryChip({ cat, isActive, onPress }: { cat: Category; isActive: boolean; onPress: () => void }) {
  const icon = CATEGORY_ICON_MAP[cat.icon] ?? DEFAULT_CATEGORY_ICON

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        isActive
          ? [styles.chipActive, { backgroundColor: cat.color }]
          : [styles.chipInactive, { borderColor: cat.color + '30' }],
      ]}
    >
      {/* icon circle */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : cat.bg },
        ]}
      >
        <HugeiconsIcon
          icon={icon}
          size={16}
          color={isActive ? '#fff' : cat.color}
          strokeWidth={isActive ? 2 : 1.5}
        />
      </View>

      {/* label */}
      <Text
        style={[
          styles.label,
          { color: isActive ? '#fff' : '#374151', fontFamily: isActive ? FONT.semiBold : FONT.medium },
        ]}
        numberOfLines={1}
      >
        {cat.name}
      </Text>
    </TouchableOpacity>
  )
}

function CategoryIconGrid({ categories, onSelect, selected }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map(cat => (
        <CategoryChip
          key={cat.id}
          cat={cat}
          isActive={selected === cat.id}
          onPress={() => onSelect?.(cat)}
        />
      ))}
    </ScrollView>
  )
}

export default memo(CategoryIconGrid)

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.page,
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    ...shadowStyles.card,
  },
  chipActive: {
    borderWidth: 0,
  },
  chipInactive: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    maxWidth: 70,
  },
})
