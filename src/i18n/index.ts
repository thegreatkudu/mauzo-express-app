import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import * as SecureStore from 'expo-secure-store'

import { resources } from './resources'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './languages'

const deviceLocale = getLocales()[0]?.languageCode ?? DEFAULT_LANGUAGE
const supportedLanguages = Object.keys(resources)

function resolveLanguage(locale: string | null): string {
  if (!locale) return DEFAULT_LANGUAGE
  if (supportedLanguages.includes(locale)) return locale
  const base = locale.split('-')[0]
  if (supportedLanguages.includes(base)) return base
  return DEFAULT_LANGUAGE
}

let savedLanguage: string | null = null
try {
  savedLanguage = SecureStore.getItem(LANGUAGE_STORAGE_KEY)
} catch {
  // SecureStore.getItem is synchronous on native — falls back gracefully
}

const initialLanguage = resolveLanguage(savedLanguage ?? deviceLocale)

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })

export default i18n
