import { forwardRef, useState } from 'react'
import { StyleSheet, TextInput, type TextInputProps, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ShowPasswordIcon, HidePasswordIcon } from '@/constants/icons'
import { useTheme } from '@/hooks/use-theme'

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
  hasError?: boolean
}

const PasswordInput = forwardRef<TextInput, Props>(function PasswordInput(
  { hasError, style, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const { theme } = useTheme()

  return (
    <View style={[
      styles.row,
      {
        height: 56,
        backgroundColor: theme.colors.inputBg,
        borderColor: hasError ? theme.colors.danger : theme.colors.inputBorder,
      },
    ]}>
      <TextInput
        ref={ref}
        {...props}
        secureTextEntry={!visible}
        style={[styles.input, { color: theme.colors.text }, style]}
        placeholderTextColor={theme.colors.placeholder}
        autoCapitalize='none'
        autoCorrect={false}
        spellCheck={false}
      />
      <TouchableOpacity onPress={() => setVisible(v => !v)} hitSlop={8} activeOpacity={0.7}>
        <HugeiconsIcon
          icon={visible ? HidePasswordIcon : ShowPasswordIcon}
          size={20}
          color={theme.colors.textMuted}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
})

export default PasswordInput
