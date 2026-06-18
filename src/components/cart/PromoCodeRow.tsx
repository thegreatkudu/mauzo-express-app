import { useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useCartStore } from '@/store/cart.store'
import { TagIcon, CloseIcon, AlertCircleIcon } from '@/constants/icons'

export default function PromoCodeRow() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const shakeAnim = useRef(new Animated.Value(0)).current

  const appliedPromo = useCartStore(s => s.appliedPromo)
  const promoError   = useCartStore(s => s.promoError)
  const applyPromo   = useCartStore(s => s.applyPromo)
  const removePromo  = useCartStore(s => s.removePromo)

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 40,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 40,  useNativeDriver: true }),
    ]).start()
  }

  async function handleApply() {
    if (!input.trim()) return
    setLoading(true)
    // simulate slight async
    await new Promise(r => setTimeout(r, 320))
    const ok = applyPromo(input)
    setLoading(false)
    if (ok) {
      setInput('')
    } else {
      shake()
    }
  }

  // Applied state
  if (appliedPromo) {
    return (
      <View style={styles.appliedRow}>
        <View style={styles.appliedLeft}>
          <View style={styles.appliedIcon}>
            <HugeiconsIcon icon={TagIcon} size={14} color='#10B981' strokeWidth={1.5} />
          </View>
          <View>
            <Text style={styles.appliedCode}>{appliedPromo.code}</Text>
            <Text style={styles.appliedLabel}>{appliedPromo.label}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={removePromo} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={CloseIcon} size={20} color='#9CA3AF' strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View>
      <Animated.View style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={[styles.inputWrap, promoError ? styles.inputWrapError : null]}>
          <View style={styles.inputIcon}>
            <HugeiconsIcon icon={TagIcon} size={16} color='#9CA3AF' strokeWidth={1.5} />
          </View>
          <TextInput
            value={input}
            onChangeText={t => setInput(t.toUpperCase())}
            placeholder='Promo code'
            placeholderTextColor='#9CA3AF'
            style={styles.textInput}
            autoCapitalize='characters'
            returnKeyType='done'
            onSubmitEditing={handleApply}
            editable={!loading}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={() => setInput('')} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={16} color='#D1D5DB' strokeWidth={1.5} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={handleApply}
          style={[styles.applyBtn, (!input.trim() || loading) && styles.applyBtnDisabled]}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>{loading ? '…' : 'Apply'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {promoError && (
        <View style={styles.errorRow}>
          <HugeiconsIcon icon={AlertCircleIcon} size={13} color='#EF4444' strokeWidth={1.5} />
          <Text style={styles.errorText}>{promoError}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    letterSpacing: 0.8,
  },
  applyBtn: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#B33600',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  applyBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  appliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appliedIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedCode: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  appliedLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#10B981',
    marginTop: 1,
  },
})
