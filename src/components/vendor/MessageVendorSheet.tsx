import { useState } from 'react'
import {
  KeyboardAvoidingView, Modal, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { VendorStore } from '@/types'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, CloseIcon, CheckCircleIcon, ChatIcon } from '@/constants/icons'

interface Props {
  vendor: VendorStore
  visible: boolean
  onClose: () => void
}

export default function MessageVendorSheet({ vendor, visible, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const vendorIcon = CATEGORY_ICON_MAP[vendor.icon] ?? DEFAULT_CATEGORY_ICON

  function handleSend() {
    if (!message.trim()) return
    setSent(true)
    setMessage('')
    setTimeout(() => {
      setSent(false)
      onClose()
    }, 1400)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* handle */}
          <View style={styles.handle} />

          {/* header */}
          <View style={styles.header}>
            <View style={[styles.logoWrap, { backgroundColor: vendor.color }]}>
              <HugeiconsIcon icon={vendorIcon} size={20} color='#fff' strokeWidth={1.5} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.toLabel}>Message</Text>
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <HugeiconsIcon icon={CloseIcon} size={22} color='#9CA3AF' strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View style={styles.sentState}>
              <View style={[styles.sentIcon, { backgroundColor: vendor.color }]}>
                <HugeiconsIcon icon={CheckCircleIcon} size={28} color='#fff' strokeWidth={2} />
              </View>
              <Text style={[styles.sentText, { color: vendor.color }]}>Message Sent!</Text>
              <Text style={styles.sentSub}>{vendor.name} will reply soon.</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder={`Hi ${vendor.name}, I'd like to ask about…`}
                placeholderTextColor='#9CA3AF'
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical='top'
                autoFocus
              />

              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.85}
                style={[styles.sendBtn, { backgroundColor: message.trim() ? vendor.color : '#E8E8E8' }]}
              >
                <Text style={[styles.sendText, { color: message.trim() ? '#fff' : '#9CA3AF' }]}>Send Message</Text>
                <HugeiconsIcon icon={ChatIcon} size={16} color={message.trim() ? '#fff' : '#9CA3AF'} strokeWidth={1.5} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  toLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  vendorName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    minHeight: 110,
    marginBottom: 16,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  sendText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  sentState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  sentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  sentSub: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
})
