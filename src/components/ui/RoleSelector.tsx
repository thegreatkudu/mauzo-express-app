import { Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { UserRole } from '@/types/auth.types'
import { PersonIcon, StorefrontIcon, DeliveryIcon } from '@/constants/icons'
import type { IconSvgElement } from '@/constants/icons'

const ROLES: Array<{ value: UserRole; label: string; icon: IconSvgElement; desc: string }> = [
  { value: 'customer', label: 'Customer', icon: PersonIcon as unknown as IconSvgElement,    desc: 'Shop products' },
  { value: 'vendor',   label: 'Vendor',   icon: StorefrontIcon as unknown as IconSvgElement, desc: 'Sell products' },
  { value: 'rider',    label: 'Rider',    icon: DeliveryIcon as unknown as IconSvgElement,  desc: 'Deliver orders' },
]

interface Props {
  value: UserRole | null
  onChange: (role: UserRole) => void
  error?: string
}

export default function RoleSelector({ value, onChange, error }: Props) {
  return (
    <View className='gap-y-1.5'>
      <View className='flex-row gap-x-2'>
        {ROLES.map(role => {
          const active = value === role.value
          return (
            <TouchableOpacity
              key={role.value}
              onPress={() => onChange(role.value)}
              activeOpacity={0.8}
              className={[
                'flex-1 items-center py-4 px-1 rounded-2xl border-2 gap-y-1.5',
                active
                  ? 'border-[#CE4002] bg-[#fce4ef]'
                  : 'border-[#E5E7EB] bg-[#F9FAFB]',
              ].join(' ')}
            >
              <View className={[
                'w-10 h-10 rounded-xl items-center justify-center',
                active ? 'bg-[#CE4002]' : 'bg-[#E5E7EB]',
              ].join(' ')}>
                <HugeiconsIcon
                  icon={role.icon}
                  size={20}
                  color={active ? '#fff' : '#9CA3AF'}
                  strokeWidth={active ? 2 : 1.5}
                />
              </View>
              <Text className={[
                'text-xs font-poppins-bold',
                active ? 'text-[#CE4002]' : 'text-[#374151]',
              ].join(' ')}>
                {role.label}
              </Text>
              <Text className='text-[10px] font-poppins text-[#9CA3AF] text-center'>
                {role.desc}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      {!!error && (
        <Text className='text-xs font-poppins text-[#EF4444]'>{error}</Text>
      )}
    </View>
  )
}
