import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useResponsive } from '@/hooks/useResponsive'
import type { IconSvgElement } from '@/constants/icons'

interface EmptyStateProps {
  icon: IconSvgElement
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { rf, isTablet, hp } = useResponsive()

  const iconWrapSize = isTablet ? 104 : 88

  return (
    <View style={[styles.root, { paddingHorizontal: hp + 24, paddingVertical: isTablet ? 80 : 60 }]}>
      <View style={[
        styles.iconWrap,
        { width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 },
      ]}>
        <HugeiconsIcon icon={icon} size={isTablet ? 48 : 40} color='#D1D5DB' strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { fontSize: rf(17) }]}>{title}</Text>
      <Text style={[styles.subtitle, { fontSize: rf(13) }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.btn, isTablet && styles.btnTablet]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { fontSize: rf(14) }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrap: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#CE4002',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnTablet: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
})
