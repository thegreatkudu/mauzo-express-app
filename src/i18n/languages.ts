export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  isRTL: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',   nativeName: 'English',   flag: '🇬🇧', isRTL: false },
  { code: 'sw', name: 'Swahili',   nativeName: 'Kiswahili', flag: '🇹🇿', isRTL: false },
]

export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_STORAGE_KEY = 'mauzo_language'
