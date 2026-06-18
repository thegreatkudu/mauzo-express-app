// Snapcart-style primary button with scale press feedback.
// Variants: filled (default), outline, ghost
import { memo, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import type { IconSvgElement } from '@/constants/icons'
import { C, F, R, S, TS, shadowStyles } from '@/theme'

type Variant = 'filled' | 'outline' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface Props {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  color?: string
  icon?: IconSvgElement
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

const PAD  = { sm: [7, 14],  md: [11, 20], lg: [14, 28] } as const
const FONT_SZ = { sm: TS.sm, md: TS.base, lg: TS.lg } as const
const ICON_SZ = { sm: 13,    md: 15,      lg: 17 } as const

function PrimaryButton({
  label, onPress, variant = 'filled', size = 'md',
  color = C.primary, icon, iconPosition = 'right',
  disabled = false, fullWidth = false, style,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  function pressIn()  { Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start() }
  function pressOut() { Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start() }

  const [pv, ph] = PAD[size]
  const fs = FONT_SZ[size]
  const isz = ICON_SZ[size]

  const containerStyle: ViewStyle = {
    paddingVertical:   pv,
    paddingHorizontal: ph,
    backgroundColor:
      variant === 'filled'  ? (disabled ? C.border : color) :
      variant === 'outline' ? 'transparent' : 'transparent',
    borderWidth:  variant === 'outline' ? 1.5 : 0,
    borderColor:  variant === 'outline' ? (disabled ? C.border : color) : 'transparent',
    opacity:      disabled ? 0.55 : 1,
    ...(fullWidth && { alignSelf: 'stretch' }),
    ...(variant === 'filled' && !disabled ? shadowStyles.soft : {}),
  }

  const textColor =
    variant === 'filled' ? '#fff' :
    (disabled ? C.textMuted : color)

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[styles.btn, containerStyle]}
      >
        {icon && iconPosition === 'left' && (
          <HugeiconsIcon icon={icon} size={isz} color={textColor} strokeWidth={2} />
        )}
        <Text style={[styles.label, { fontSize: fs, color: textColor }]}>{label}</Text>
        {icon && iconPosition === 'right' && (
          <HugeiconsIcon icon={icon} size={isz} color={textColor} strokeWidth={2} />
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default memo(PrimaryButton)

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.full,  // Snapcart uses pill-shaped buttons
    gap: S.xs,
  },
  label: {
    fontFamily: F.semiBold,
  },
})
