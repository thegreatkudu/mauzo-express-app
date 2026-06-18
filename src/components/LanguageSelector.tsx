import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CheckCircleIcon, GlobeIcon } from '@/constants/icons'
import { useLanguage } from '@/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

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
        <HugeiconsIcon icon={GlobeIcon} size={16} color='#9CA3AF' strokeWidth={1.5} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType='slide' onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
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
                    <HugeiconsIcon icon={CheckCircleIcon} size={20} color='#CE4002' strokeWidth={2} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  triggerFlag:  { fontSize: 16 },
  triggerLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#374151', flex: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
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
  optionActive: { backgroundColor: '#FEF0E6' },
  optionFlag:   { fontSize: 24 },
  optionText:   { flex: 1, gap: 2 },
  optionNative: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#111827' },
  optionNativeActive: { color: '#CE4002' },
  optionName:   { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
})
