import * as SecureStore from 'expo-secure-store'
import { AuthUser, AuthTokens } from '@/types/auth.types'

const K = {
  ACCESS_TOKEN:  'mauzo_access_token',
  REFRESH_TOKEN: 'mauzo_refresh_token',
  USER:          'mauzo_user',
} as const

export async function saveSession(tokens: AuthTokens, user: AuthUser) {
  await Promise.all([
    SecureStore.setItemAsync(K.ACCESS_TOKEN,  tokens.accessToken),
    SecureStore.setItemAsync(K.REFRESH_TOKEN, tokens.refreshToken),
    SecureStore.setItemAsync(K.USER,          JSON.stringify(user)),
  ])
}

export async function loadSession(): Promise<{ tokens: AuthTokens; user: AuthUser } | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(K.ACCESS_TOKEN),
    SecureStore.getItemAsync(K.REFRESH_TOKEN),
    SecureStore.getItemAsync(K.USER),
  ])
  if (!accessToken || !userRaw) return null
  return {
    tokens: { accessToken, refreshToken: refreshToken ?? '' },
    user: JSON.parse(userRaw) as AuthUser,
  }
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(K.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(K.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(K.USER),
  ])
}
