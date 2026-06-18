import { forwardRef, useState } from 'react'
import { TextInput, type TextInputProps, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ShowPasswordIcon, HidePasswordIcon } from '@/constants/icons'

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
  hasError?: boolean
}

const PasswordInput = forwardRef<TextInput, Props>(function PasswordInput(
  { hasError, style, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <View className={[
      'flex-row items-center h-14 px-4 rounded-2xl border bg-[#F9FAFB]',
      hasError ? 'border-[#EF4444]' : 'border-[#E5E7EB]',
    ].join(' ')}>
      <TextInput
        ref={ref}
        {...props}
        secureTextEntry={!visible}
        className='flex-1 text-sm font-poppins text-[#111827]'
        placeholderTextColor='#9CA3AF'
        autoCapitalize='none'
        autoCorrect={false}
        spellCheck={false}
      />
      <TouchableOpacity onPress={() => setVisible(v => !v)} hitSlop={8} activeOpacity={0.7}>
        <HugeiconsIcon
          icon={visible ? HidePasswordIcon : ShowPasswordIcon}
          size={20}
          color='#9CA3AF'
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    </View>
  )
})

export default PasswordInput
