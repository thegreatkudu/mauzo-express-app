import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@expo/ui/community/bottom-sheet'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import { VendorStore } from '@/types'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, CloseIcon, CheckCircleIcon, ChatIcon } from '@/constants/icons'
import type { AppTheme } from '@/hooks/use-theme'

interface Props {
  vendor: VendorStore
  visible: boolean
  onClose: () => void
}

export default function MessageVendorSheet({ vendor, visible, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)

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
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
    >
      <BottomSheetView style={styles.content}>
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
            <HugeiconsIcon icon={CloseIcon} size={22} color={theme.colors.textMuted} strokeWidth={1.5} />
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
            <BottomSheetTextInput
              style={styles.input}
              placeholder={`Hi ${vendor.name}, I'd like to ask about…`}
              placeholderTextColor={theme.colors.placeholder}
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
              style={[styles.sendBtn, { backgroundColor: message.trim() ? vendor.color : theme.colors.cardAlt }]}
            >
              <Text style={[styles.sendText, { color: message.trim() ? '#fff' : theme.colors.textMuted }]}>Send Message</Text>
              <HugeiconsIcon icon={ChatIcon} size={16} color={message.trim() ? '#fff' : theme.colors.textMuted} strokeWidth={1.5} />
            </TouchableOpacity>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 20,
      paddingBottom: 36,
      paddingTop: 8,
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
      color: colors.textMuted,
    },
    vendorName: {
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      padding: 14,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
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
      color: colors.textMuted,
    },
  })
}
