import { useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ChevronDownIcon } from '@/constants/icons'

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function AccordionSection({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current

  function toggle() {
    const toValue = open ? 0 : 1
    Animated.spring(rotate, { toValue, useNativeDriver: true, speed: 20 }).start()
    setOpen(o => !o)
  }

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <HugeiconsIcon icon={ChevronDownIcon} size={18} color='#6B7280' strokeWidth={1.5} />
        </Animated.View>
      </TouchableOpacity>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  content: {
    paddingBottom: 16,
  },
})
