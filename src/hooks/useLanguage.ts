import { useTranslation } from 'react-i18next'
import * as SecureStore from 'expo-secure-store'
import { LANGUAGE_STORAGE_KEY, LANGUAGES } from '@/i18n/languages'

export function useLanguage() {
  const { i18n } = useTranslation()

  async function changeLanguage(code: string) {
    await i18n.changeLanguage(code)
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, code)
    } catch {
      // non-fatal — preference won't persist across restarts
    }
  }

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    languages: LANGUAGES,
  }
}
