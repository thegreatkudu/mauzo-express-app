import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrashIcon, MinusIcon, AddIcon } from '@/constants/icons'
import { shadows } from '@/theme'

interface Props {
  price: number
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  onAdd: () => void
  loading?: boolean
  inCart?: boolean
  outOfStock?: boolean
}

export default function AddToCartButton({
  price,
  quantity,
  onDecrease,
  onIncrease,
  onAdd,
  loading = false,
  inCart = false,
  outOfStock = false,
}: Props) {
  const insets = useSafeAreaInsets()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [justAdded, setJustAdded] = useState(false)

  function handleAdd() {
    if (loading || outOfStock) return
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start()
    onAdd()
    setJustAdded(true)
  }

  useEffect(() => {
    if (!justAdded) return
    const id = setTimeout(() => setJustAdded(false), 1800)
    return () => clearTimeout(id)
  }, [justAdded])

  const total = (price * quantity).toFixed(2)
  const label = outOfStock ? 'Out of Stock' : justAdded ? 'Added to Cart ✓' : inCart ? 'Add More' : 'Add to Cart'

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* quantity stepper */}
      <View style={styles.stepper}>
        <TouchableOpacity onPress={onDecrease} style={styles.stepBtn} hitSlop={6} activeOpacity={0.7}>
          <HugeiconsIcon
            icon={quantity === 1 ? TrashIcon : MinusIcon}
            size={18}
            color={quantity === 1 ? '#EF4444' : '#374151'}
            strokeWidth={1.5}
          />
        </TouchableOpacity>
        <Text style={styles.qty}>{quantity}</Text>
        <TouchableOpacity onPress={onIncrease} style={[styles.stepBtn, styles.stepBtnAdd]} hitSlop={6} activeOpacity={0.7}>
          <HugeiconsIcon icon={AddIcon} size={18} color='#fff' strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* add button */}
      <Animated.View style={[styles.btnWrap, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={handleAdd}
          activeOpacity={0.88}
          disabled={loading || outOfStock}
          style={styles.btnTouchable}
        >
          <LinearGradient
            colors={outOfStock ? ['#9CA3AF', '#9CA3AF'] : justAdded ? ['#10B981', '#059669'] : ['#B33600', '#CE4002']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            {loading ? (
              <Text style={styles.btnText}>Adding…</Text>
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>{label}</Text>
                {!outOfStock && (
                  <View style={styles.pricePill}>
                    <Text style={styles.priceText}>${total}</Text>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    ...shadows.heavy,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnAdd: {
    backgroundColor: '#B33600',
  },
  qty: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  btnWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  btn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  pricePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
})
