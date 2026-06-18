import { AuthUser, AuthTokens, SignInPayload, SignUpPayload, OTPContext, UserRole } from '@/types/auth.types'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// In-memory mock store (survives hot reload within a session)
const MOCK_USERS: Map<string, AuthUser & { password: string }> = new Map([
  ['demo@mauzo.com', {
    id: 'u_demo',
    name: 'Demo Customer',
    email: 'demo@mauzo.com',
    phone: '+254700000001',
    role: 'customer',
    isVerified: true,
    createdAt: '2024-01-01',
    password: 'password123',
  }],
  ['vendor@mauzo.com', {
    id: 'u_vendor',
    name: 'Demo Vendor',
    email: 'vendor@mauzo.com',
    phone: '+254700000002',
    role: 'vendor',
    isVerified: true,
    createdAt: '2024-01-01',
    password: 'password123',
  }],
  ['rider@mauzo.com', {
    id: 'u_rider',
    name: 'Demo Rider',
    email: 'rider@mauzo.com',
    phone: '+254700000003',
    role: 'rider',
    isVerified: true,
    createdAt: '2024-01-01',
    password: 'password123',
  }],
])

const MOCK_OTP_STORE: Map<string, string> = new Map()

function makeMockToken(userId: string, type: 'access' | 'refresh') {
  return `mock_${type}_${userId}_${Date.now()}`
}

function stripPassword({ password: _, ...user }: AuthUser & { password: string }): AuthUser {
  return user
}

export async function signIn(payload: SignInPayload): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  await delay(900)
  const record = MOCK_USERS.get(payload.email.toLowerCase())
  if (!record || record.password !== payload.password) {
    throw new Error('Invalid email or password')
  }
  if (!record.isVerified) {
    throw new Error('UNVERIFIED')
  }
  const user = stripPassword(record)
  return {
    user,
    tokens: {
      accessToken:  makeMockToken(user.id, 'access'),
      refreshToken: makeMockToken(user.id, 'refresh'),
    },
  }
}

export async function signUp(payload: SignUpPayload): Promise<{ email: string }> {
  await delay(1000)
  const key = payload.email.toLowerCase()
  if (MOCK_USERS.has(key)) {
    throw new Error('An account with this email already exists')
  }
  const id = `u_${Date.now()}`
  MOCK_USERS.set(key, {
    id,
    name: payload.name,
    email: key,
    phone: payload.phone,
    role: payload.role as UserRole,
    isVerified: false,
    createdAt: new Date().toISOString(),
    password: payload.password,
  })
  // generate and store mock OTP
  MOCK_OTP_STORE.set(`${key}_verify`, '123456')
  return { email: key }
}

export async function sendOTP(email: string, context: OTPContext): Promise<void> {
  await delay(800)
  const key = email.toLowerCase()
  if (context === 'forgot' && !MOCK_USERS.has(key)) {
    throw new Error('No account found with this email')
  }
  MOCK_OTP_STORE.set(`${key}_${context}`, '123456')
}

export async function verifyOTP(email: string, otp: string, context: OTPContext): Promise<void> {
  await delay(700)
  const stored = MOCK_OTP_STORE.get(`${email.toLowerCase()}_${context}`)
  if (!stored || stored !== otp) {
    throw new Error('Invalid or expired OTP')
  }
  MOCK_OTP_STORE.delete(`${email.toLowerCase()}_${context}`)
  if (context === 'verify') {
    const record = MOCK_USERS.get(email.toLowerCase())
    if (record) record.isVerified = true
  }
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  await delay(900)
  const record = MOCK_USERS.get(email.toLowerCase())
  if (!record) throw new Error('Account not found')
  record.password = newPassword
}

export async function autoSignInAfterVerify(email: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  await delay(400)
  const record = MOCK_USERS.get(email.toLowerCase())
  if (!record) throw new Error('Account not found')
  const user = stripPassword(record)
  return {
    user,
    tokens: {
      accessToken:  makeMockToken(user.id, 'access'),
      refreshToken: makeMockToken(user.id, 'refresh'),
    },
  }
}
