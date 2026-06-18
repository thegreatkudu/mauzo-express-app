import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'
import { PhoneIcon, BackIcon } from '@/constants/icons'
import { ADMIN_PHONE } from '@/constants/config'

export default function ForgotScreen() {
  const { t } = useTranslation()
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={20} color='#111827' strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auth.forgot.header_title')}</Text>
        {/* spacer keeps title visually centred */}
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <HugeiconsIcon icon={PhoneIcon} size={40} color='#CE4002' strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>{t('auth.forgot.title')}</Text>
        <Text style={styles.message}>{t('auth.forgot.message')}</Text>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${ADMIN_PHONE.replace(/\s/g, '')}`)}
          activeOpacity={0.85}
        >
          <HugeiconsIcon icon={PhoneIcon} size={18} color='#fff' strokeWidth={2} />
          <Text style={styles.callBtnText}>{t('auth.forgot.call_admin')}</Text>
        </TouchableOpacity>

        <Text style={styles.adminPhone}>{ADMIN_PHONE}</Text>

        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t('auth.forgot.back_to_sign_in')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  headerSpacer: { width: 40 },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },

  iconWrap: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: '#FEF0E6', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title:   { fontSize: 24, fontFamily: 'Poppins-Bold',    color: '#111827', textAlign: 'center' },
  message: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center', lineHeight: 24 },

  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#CE4002', paddingHorizontal: 28, paddingVertical: 15,
    borderRadius: 16, marginTop: 8,
  },
  callBtnText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#fff' },

  adminPhone: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#374151', letterSpacing: 0.5 },

  backLink:     { marginTop: 8 },
  backLinkText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
})
