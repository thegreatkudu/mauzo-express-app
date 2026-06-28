import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'
import { PhoneIcon, BackIcon } from '@/constants/icons'
import { ADMIN_PHONE } from '@/constants/config'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import { shadows } from '@/theme'

export default function ForgotScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8} activeOpacity={0.7}>
          <HugeiconsIcon icon={BackIcon} size={20} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auth.forgot.header_title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <HugeiconsIcon icon={PhoneIcon} size={40} color={theme.colors.primary} strokeWidth={1.5} />
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

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },

    header: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 20,
      paddingTop:        12,
      paddingBottom:     8,
    },
    backBtn: {
      width:           40,
      height:          40,
      borderRadius:    13,
      backgroundColor: theme.colors.card,
      alignItems:      'center',
      justifyContent:  'center',
      ...shadows.medium,
    },
    headerTitle: {
      flex:       1,
      textAlign:  'center',
      fontSize:   17,
      fontFamily: 'Poppins-SemiBold',
      color:      theme.colors.text,
    },
    headerSpacer: { width: 40 },

    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },

    iconWrap: {
      width:           88,
      height:          88,
      borderRadius:    28,
      backgroundColor: theme.colors.primaryLight,
      alignItems:      'center',
      justifyContent:  'center',
      marginBottom:    8,
    },
    title:   { fontSize: 24, fontFamily: 'Poppins-Bold',    color: theme.colors.text,    textAlign: 'center' },
    message: { fontSize: 15, fontFamily: 'Poppins-Regular', color: theme.colors.textSub, textAlign: 'center', lineHeight: 24 },

    callBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               8,
      backgroundColor:   theme.colors.primary,
      paddingHorizontal: 28,
      paddingVertical:   15,
      borderRadius:      16,
      marginTop:         8,
    },
    callBtnText: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#fff' },

    adminPhone: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: theme.colors.text, letterSpacing: 0.5 },

    backLink:     { marginTop: 8 },
    backLinkText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },
  })
}
