import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Props {
  sizes: string[]
  selected: string | null
  onSelect: (size: string) => void
  label?: string
}

export default function SizeSelector({ sizes, selected, onSelect, label = 'Size' }: Props) {
  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {selected && <Text style={styles.selected}>{selected}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {sizes.map(size => {
          const active = selected === size
          return (
            <TouchableOpacity
              key={size}
              onPress={() => onSelect(size)}
              activeOpacity={0.75}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{size}</Text>
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
  selected: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#B33600',
  },
  row: {
    gap: 8,
  },
  chip: {
    minWidth: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: '#B33600',
    borderColor: '#B33600',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
})
