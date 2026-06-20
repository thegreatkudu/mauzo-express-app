import { useEffect, useRef } from 'react'
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CartStoreItem } from '@/store/cart.store'
import { CATEGORY_META } from '@/data/mock'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, TrashIcon } from '@/constants/icons'

interface Props {
  item: CartStoreItem | null
  onConfirm: () => void
  onCancel: () => void
}

const { height } = Dimensions.get('window')

export default function RemoveConfirmSheet({ item, onConfirm, onCancel }: Props) {
  const slideAnim = useRef(new Animated.Value(height)).current
  const visible = item !== null

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start()
    } else {
      slideAnim.setValue(height)
    }
  }, [visible, slideAnim, height])

  function handleClose() {
    Animated.timing(slideAnim, { toValue: height, duration: 220, useNativeDriver: true }).start(onCancel)
  }

  function handleConfirm() {
    Animated.timing(slideAnim, { toValue: height, duration: 180, useNativeDriver: true }).start(onConfirm)
  }

  if (!item) return null

  const meta = CATEGORY_META[item.product.category] ?? { color: '#CE4002', icon: 'bag-outline', bg: '#FEF0E6' }
  const categoryIcon = CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON

  return (
    <Modal transparent visible={visible} animationType='fade' onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="absolute inset-0 bg-black/[0.45]" />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* handle */}
        <View style={styles.handle} />

        {/* heading */}
        <View style={styles.headingRow}>
          <View style={[styles.warningIcon, { backgroundColor: '#FEF2F2' }]}>
            <HugeiconsIcon icon={TrashIcon} size={22} color='#EF4444' strokeWidth={1.5} />
          </View>
          <View style={styles.headingText}>
            <Text style={styles.title}>Remove item?</Text>
            <Text style={styles.subtitle}>This item will be removed from your cart</Text>
          </View>
        </View>

        {/* item preview */}
        <View style={styles.itemPreview}>
          <View style={[styles.thumbWrap, { backgroundColor: meta.color + '18' }]}>
            <HugeiconsIcon icon={categoryIcon} size={24} color={meta.color} strokeWidth={1.5} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
            {item.variant?.size && <Text style={styles.itemMeta}>Size: {item.variant.size}</Text>}
            {item.variant?.color && <Text style={styles.itemMeta}>Color: {item.variant.color}</Text>}
            <Text style={styles.itemPrice}>${item.product.price.toFixed(2)} × {item.quantity}</Text>
          </View>
        </View>

        {/* actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.75}>
            <Text style={styles.cancelText}>Keep item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={styles.removeText}>Yes, remove</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    lineHeight: 20,
  },
  itemMeta: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#CE4002',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  removeBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
})
