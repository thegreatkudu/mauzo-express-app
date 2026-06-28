import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BottomSheet, { BottomSheetView } from '@expo/ui/community/bottom-sheet'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CheckCircleIcon, GlobeIcon } from '@/constants/icons'
import { useLanguage } from '@/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)

  const current = languages.find(l => l.code === currentLanguage) ?? languages[0]

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        hitSlop={8}
      >
        <Text style={styles.triggerFlag}>{current.flag}</Text>
        <Text style={styles.triggerLabel}>{current.nativeName}</Text>
        <HugeiconsIcon icon={GlobeIcon} size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
      </TouchableOpacity>

      <BottomSheet
        index={open ? 0 : -1}
        enablePanDownToClose
        onClose={() => setOpen(false)}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.sheetTitle}>{t('profile.select_language')}</Text>
          {languages.map(lang => {
            const isSelected = lang.code === currentLanguage
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.option, isSelected && styles.optionActive]}
                onPress={() => { changeLanguage(lang.code); setOpen(false) }}
                activeOpacity={0.75}
              >
                <Text style={styles.optionFlag}>{lang.flag}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionNative, isSelected && styles.optionNativeActive]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.optionName}>{lang.name}</Text>
                </View>
                {isSelected && (
                  <HugeiconsIcon icon={CheckCircleIcon} size={20} color={theme.colors.primary} strokeWidth={2} />
                )}
              </TouchableOpacity>
            )
          })}
        </BottomSheetView>
      </BottomSheet>
    </>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerFlag:  { fontSize: 16 },
    triggerLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: colors.text, flex: 1 },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 36,
      paddingTop: 8,
    },
    sheetTitle: {
      fontSize: 17,
      fontFamily: 'Poppins-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },

    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 6,
    },
    optionActive:       { backgroundColor: colors.primaryLight },
    optionFlag:         { fontSize: 24 },
    optionText:         { flex: 1, gap: 2 },
    optionNative:       { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: colors.text },
    optionNativeActive: { color: colors.primary },
    optionName:         { fontSize: 12, fontFamily: 'Poppins-Regular',  color: colors.textMuted },
  })
}
