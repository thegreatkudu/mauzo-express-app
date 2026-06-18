import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '@/constants/config'

const JWT_KEY = 'mauzo_jwt_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(JWT_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 ────────────────────────────────────────
let _onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync(JWT_KEY).catch(() => {})
      _onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

// ── Token helpers ─────────────────────────────────────────────────────────────
export async function storeToken(token: string) {
  await SecureStore.setItemAsync(JWT_KEY, token)
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(JWT_KEY)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY)
}

// ── Error extraction ──────────────────────────────────────────────────────────
export function extractApiError(error: unknown): { message: string; fieldErrors?: Record<string, string> } {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.error) return { message: data.error, fieldErrors: data.field_errors }
    if (error.code === 'ECONNABORTED') return { message: 'Request timed out. Please try again.' }
    if (!error.response) return { message: 'No internet connection.' }
  }
  return { message: 'Something went wrong. Please try again.' }
}
