import { Text, View } from 'react-native'

interface Props {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export default function FormField({ label, error, children, required }: Props) {
  return (
    <View className='gap-y-1.5'>
      <Text className='text-sm font-poppins-semibold text-[#374151]'>
        {label}{required && <Text className='text-[#EF4444]'> *</Text>}
      </Text>
      {children}
      {!!error && (
        <Text className='text-xs font-poppins text-[#EF4444]'>{error}</Text>
      )}
    </View>
  )
}
