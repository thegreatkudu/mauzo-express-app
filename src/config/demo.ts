/**
 * DEMO / DEVELOPMENT AUTHENTICATION
 *
 * Flip DEMO_MODE to `false` (or delete this file's import in auth.ts)
 * before production deployment. Nothing else needs to change.
 *
 * When DEMO_MODE is true:
 *  - Logging in with DEMO_PHONE + DEMO_PASSWORD skips the real API.
 *  - A fake token (DEMO_TOKEN) is stored in SecureStore just like a real JWT.
 *  - On app restart, hydrate() reads that token and returns DEMO_PROFILE
 *    without hitting the network.
 *  - All other production auth infrastructure (interceptors, logout, route
 *    guards, session management) continues to operate normally.
 */

import type { UserProfile } from '@/types'

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const DEMO_MODE = true          // ← set to false for production

// ─── Demo credentials (must match TEST_PHONE / TEST_PASSWORD in signin.tsx) ──
export const DEMO_PHONE    = '255700000000'   // toApiPhone('0700000000')
export const DEMO_PASSWORD = 'password123'

// ─── Sentinel token — never a real JWT, easy to grep + audit ─────────────────
export const DEMO_TOKEN = '__MAUZO_DEMO_TOKEN_DEV_ONLY__'

// ─── Mock profile — realistic shape, active trial subscription ────────────────
export const DEMO_PROFILE: UserProfile = {
  id:            9999,
  business_name: 'Demo Business Ltd',
  phone:         '255700000000',
  location:      'Dar es Salaam',
  category:      { id: 1, name: 'General Trade' },
  subscription: {
    type:           'trial',
    plan:           'Trial Plan',
    expires_at:     '2099-12-31T23:59:59.000Z',
    days_remaining: 30,
    is_active:      true,
  },
}
