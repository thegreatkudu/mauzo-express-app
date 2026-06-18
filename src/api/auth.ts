import { apiClient, getToken } from './client'
import type { Category, LoginPayload, LoginResponse, RegisterPayload, UserProfile, ChangePasswordPayload } from '@/types'
import { DEMO_MODE, DEMO_PHONE, DEMO_PASSWORD, DEMO_TOKEN, DEMO_PROFILE } from '@/config/demo'
import { mockGetCategories } from './mock'

export async function getCategories(): Promise<Category[]> {
  if (DEMO_MODE) return mockGetCategories()
  const res = await apiClient.get<{ success: true; data: Category[] }>('/categories')
  return res.data.data
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post('/register', payload)
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // ── Demo mode: bypass real API entirely ───────────────────────────────────
  if (DEMO_MODE) {
    // Accept both the API-normalised form and the raw display form
    const phoneOk = payload.phone === DEMO_PHONE || payload.phone === '0700000000'
    const passOk  = payload.password === DEMO_PASSWORD
    if (phoneOk && passOk) {
      return { token: DEMO_TOKEN, profile: { ...DEMO_PROFILE } }
    }
    // Return a shaped error so extractApiError surfaces the right message
    throw { isAxiosError: true, response: { status: 401, data: { error: 'Wrong phone number or password.' } } }
  }
  // ── Production path ───────────────────────────────────────────────────────
  const res = await apiClient.post<{ success: true; data: LoginResponse }>('/login', payload)
  return res.data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout')
}

export async function getProfile(): Promise<UserProfile> {
  if (DEMO_MODE) return { ...DEMO_PROFILE }
  const res = await apiClient.get<{ success: true; data: UserProfile }>('/profile')
  return res.data.data
}

export async function updateProfile(payload: { business_name: string; business_location: string }): Promise<UserProfile> {
  const res = await apiClient.put<{ success: true; data: UserProfile }>('/profile', payload)
  return res.data.data
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post('/profile/change-password', payload)
}
