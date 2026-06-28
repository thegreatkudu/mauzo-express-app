import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { TickIcon } from '@/constants/icons'
import { shadows } from '@/theme'

interface ColorOption {
  label: string
  hex: string
}

interface Props {
  colors: ColorOption[]
  selected: string | null
  onSelect: (color: ColorOption) => void
  label?: string
}

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 186
}

export default function ColorSelector({ colors, selected, onSelect, label = 'Color' }: Props) {
  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {selected && <Text style={styles.selectedLabel}>{selected}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {colors.map(color => {
          const active = selected === color.label
          const light = isLight(color.hex)
          return (
            <TouchableOpacity
              key={color.label}
              onPress={() => onSelect(color)}
              activeOpacity={0.8}
              style={[styles.swatch, { backgroundColor: color.hex }, active && styles.swatchActive]}
            >
              {active && (
                <HugeiconsIcon icon={TickIcon} size={14} color={light ? '#111827' : '#FFFFFF'} strokeWidth={2} />
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  selectedLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#CE4002',
  },
  row: {
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  swatchActive: {
    borderWidth: 2.5,
    borderColor: '#CE4002',
  },
})
