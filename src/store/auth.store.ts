import { create } from 'zustand'
import type { UserProfile } from '@/types'
import * as AuthApi from '@/api/auth'
import { storeToken, clearToken, getToken } from '@/api/client'
import { toApiPhone } from '@/utils/phone'

interface AuthState {
  profile: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean

  hydrate: () => Promise<void>
  login: (phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { business_name: string; business_location: string }) => Promise<void>
  setProfile: (profile: UserProfile) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  async hydrate() {
    try {
      const token = await getToken()
      if (token) {
        // Token exists — fetch fresh profile to validate + get subscription status
        const profile = await AuthApi.getProfile()
        set({ token, profile, isAuthenticated: true })
      }
    } catch {
      // Token invalid or expired — clear it silently
      await clearToken()
    } finally {
      set({ isHydrated: true })
    }
  },

  async login(phone, password) {
    const apiPhone = toApiPhone(phone)
    const { token, profile } = await AuthApi.login({ phone: apiPhone, password })
    await storeToken(token)
    set({ token, profile, isAuthenticated: true })
  },

  async logout() {
    try { await AuthApi.logout() } catch { /* ignore — clear locally regardless */ }
    await clearToken()
    set({ token: null, profile: null, isAuthenticated: false })
  },

  async updateProfile(data) {
    const profile = await AuthApi.updateProfile(data)
    set({ profile })
  },

  setProfile(profile) {
    set({ profile })
  },
}))
