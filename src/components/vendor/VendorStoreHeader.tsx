import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { VendorStore } from '@/types'
import { BackIcon, ShareIcon } from '@/constants/icons'

interface Props {
  vendor: VendorStore
  onBack: () => void
  onShare: () => void
}

const HEADER_H = 220

export default function VendorStoreHeader({ vendor, onBack, onShare }: Props) {
  return (
    <View style={{ height: HEADER_H }}>
      <LinearGradient
        colors={[vendor.color, vendor.color + 'aa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* subtle pattern layer */}
      <View style={styles.patternCircle1} />
      <View style={styles.patternCircle2} />

      {/* floating nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={BackIcon} size={20} color='#fff' strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.navBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={ShareIcon} size={20} color='#fff' strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -30,
  },
  patternCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -20,
  },
})
