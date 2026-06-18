import { useEffect, useRef, useState } from 'react'
import { TextInput, TouchableOpacity, View, Text, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'

const DIGIT_COUNT = 6

interface Props {
  value: string
  onChange: (val: string) => void
  hasError?: boolean
}

export default function OTPInput({ value, onChange, hasError }: Props) {
  const digits = value.padEnd(DIGIT_COUNT, '').split('').slice(0, DIGIT_COUNT)
  const inputRefs = useRef<Array<TextInput | null>>(Array(DIGIT_COUNT).fill(null))
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  useEffect(() => {
    // auto-focus first box on mount
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }, [])

  function handleChange(text: string, index: number) {
    // handle paste (multi-character input)
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, DIGIT_COUNT)
      onChange(pasted)
      const nextIndex = Math.min(pasted.length, DIGIT_COUNT - 1)
      inputRefs.current[nextIndex]?.focus()
      return
    }
    const digit = text.replace(/\D/g, '')
    const newDigits = [...digits]
    newDigits[index] = digit
    const newValue = newDigits.join('').replace(/ /g, '')
    onChange(newValue)
    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join('').replace(/ /g, ''))
      } else if (index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join('').replace(/ /g, ''))
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  return (
    <View className='flex-row gap-x-3 justify-center'>
      {Array.from({ length: DIGIT_COUNT }).map((_, i) => {
        const isFilled  = !!digits[i] && digits[i] !== ' '
        const isFocused = focusedIndex === i
        const isError   = hasError

        const boxCls = [
          'w-12 h-14 rounded-2xl border-2 items-center justify-center',
          isError   ? 'border-[#EF4444] bg-[#FEF2F2]' :
          isFocused ? 'border-[#CE4002] bg-[#fce4ef]' :
          isFilled  ? 'border-[#CE4002] bg-[#fce4ef]' :
                      'border-[#E5E7EB] bg-[#F9FAFB]',
        ].join(' ')

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={1}
            onPress={() => inputRefs.current[i]?.focus()}
            className={boxCls}
          >
            <TextInput
              ref={ref => { inputRefs.current[i] = ref }}
              value={isFilled ? digits[i] : ''}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType='number-pad'
              maxLength={DIGIT_COUNT}
              selectTextOnFocus
              className='text-xl font-poppins-bold text-[#111827] text-center w-full h-full'
              caretHidden
            />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
