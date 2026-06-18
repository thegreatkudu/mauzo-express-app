export type UserRole = 'customer' | 'vendor' | 'rider'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  isVerified: boolean
  avatarUrl?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type OTPContext = 'verify' | 'forgot'

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: UserRole
}
