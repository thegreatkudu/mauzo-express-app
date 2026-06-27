import { useEffect, useRef } from 'react'
import {
  Animated, Dimensions, Modal, Pressable,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import {
  AlertCircleIcon, CheckCircleIcon, InfoIcon,
  type IconSvgElement,
} from '@/constants/icons'
import type { AlertConfig, AlertVariant } from './types'

// ── Variant config ─────────────────────────────────────────────────────────────

const VARIANT_MAP: Record<AlertVariant, {
  color: string
  iconBg: string
  icon: IconSvgElement
}> = {
  default: {
    color:  '#CE4002',
    iconBg: 'rgba(206,64,2,0.10)',
    icon:   CheckCircleIcon,
  },
  danger: {
    color:  '#EF4444',
    iconBg: 'rgba(239,68,68,0.10)',
    icon:   AlertCircleIcon,
  },
  warning: {
    color:  '#EF9F27',
    iconBg: 'rgba(239,159,39,0.10)',
    icon:   AlertCircleIcon,
  },
  success: {
    color:  '#1D9E75',
    iconBg: 'rgba(29,158,117,0.10)',
    icon:   CheckCircleIcon,
  },
  info: {
    color:  '#6366f1',
    iconBg: 'rgba(99,102,241,0.10)',
    icon:   InfoIcon,
  },
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean
  config: AlertConfig | null
  onDismiss: () => void
}

const SCREEN_WIDTH = Dimensions.get('window').width

export default function AppAlert({ visible, config, onDismiss }: Props) {
  const backdropAnim = useRef(new Animated.Value(0)).current
  const cardAnim     = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible && config) {
      backdropAnim.setValue(0)
      cardAnim.setValue(0)
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardAnim, {
          toValue: 1,
          damping: 14,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, config])

  function requestDismiss(action: 'confirm' | 'cancel') {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (action === 'confirm') config?.onConfirm?.()
      else config?.onCancel?.()
      onDismiss()
    })
  }

  if (!config) return null

  const variant  = config.variant ?? 'default'
  const meta     = VARIANT_MAP[variant]
  const showCancel = config.showCancel !== false

  const cardScale = cardAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.86, 1],
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      statusBarTranslucent
      onRequestClose={() => requestDismiss('cancel')}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim.interpolate({
              inputRange:  [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => requestDismiss('cancel')} />
      </Animated.View>

      {/* Card */}
      <View style={styles.centerer} pointerEvents='box-none'>
        <Animated.View
          style={[
            styles.card,
            {
              opacity:   cardAnim,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: meta.iconBg }]}>
            <HugeiconsIcon
              icon={meta.icon as any}
              size={28}
              color={meta.color}
              strokeWidth={1.8}
            />
          </View>

          {/* Text */}
          <Text style={styles.title}>{config.title}</Text>
          {!!config.message && (
            <Text style={styles.message}>{config.message}</Text>
          )}

          {/* Buttons */}
          <View style={styles.divider} />
          <View style={styles.btnRow}>
            {showCancel && (
              <>
                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.6}
                  onPress={() => requestDismiss('cancel')}
                >
                  <Text style={styles.cancelText}>
                    {config.cancelText ?? 'Cancel'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.btnDivider} />
              </>
            )}
            <TouchableOpacity
              style={[styles.btn, !showCancel && styles.btnFull]}
              activeOpacity={0.6}
              onPress={() => requestDismiss('confirm')}
            >
              <Text style={[styles.confirmText, { color: meta.color }]}>
                {config.confirmText ?? 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const CARD_WIDTH = Math.min(320, SCREEN_WIDTH * 0.84)

const styles = StyleSheet.create({
  backdrop: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  centerer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
  },
  card: {
    width:           CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius:    22,
    paddingTop:      28,
    paddingBottom:   0,
    paddingHorizontal: 0,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 12 },
    shadowOpacity:   0.18,
    shadowRadius:    24,
    elevation:       16,
  },
  iconWrap: {
    width:         56,
    height:        56,
    borderRadius:  16,
    alignItems:    'center',
    justifyContent:'center',
    marginBottom:  16,
  },
  title: {
    fontFamily:  'Poppins-SemiBold',
    fontSize:    17,
    color:       '#0F172A',
    textAlign:   'center',
    lineHeight:  24,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  message: {
    fontFamily:   'Inter-Regular',
    fontSize:     14,
    color:        '#475569',
    textAlign:    'center',
    lineHeight:   21,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  divider: {
    width:           '100%',
    height:          1,
    backgroundColor: '#E2E8F0',
  },
  btnRow: {
    flexDirection: 'row',
    width:         '100%',
    height:        52,
  },
  btn: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 1,
  },
  btnDivider: {
    width:           1,
    height:          '100%',
    backgroundColor: '#E2E8F0',
  },
  cancelText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   15,
    color:      '#64748B',
  },
  confirmText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   15,
  },
})
