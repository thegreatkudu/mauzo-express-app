import { StyleSheet, Text, View } from 'react-native'

type Variant = 'discount' | 'new' | 'featured' | 'free' | 'danger' | 'success' | 'info'

interface Props {
  label: string
  variant?: Variant
  size?: 'sm' | 'md'
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string }> = {
  discount: { bg: '#EF4444', text: '#FFFFFF' },
  new:      { bg: '#10B981', text: '#FFFFFF' },
  featured: { bg: '#F59E0B', text: '#FFFFFF' },
  free:     { bg: '#CE4002', text: '#FFFFFF' },
  danger:   { bg: '#FEF2F2', text: '#EF4444' },
  success:  { bg: '#ECFDF5', text: '#10B981' },
  info:     { bg: '#FEF0E6', text: '#CE4002' },
}

export default function Badge({ label, variant = 'discount', size = 'sm' }: Props) {
  const { bg, text } = VARIANT_STYLES[variant]
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.text, { color: text }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: 12,
  },
})
