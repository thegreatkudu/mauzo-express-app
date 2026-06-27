import { Redirect } from 'expo-router'

// NavigationGuard in _layout.tsx owns all auth routing decisions.
// This index just provides a stable fallback if /(auth) is ever opened directly.
export default function AuthIndex() {
  return <Redirect href='/(auth)/signin' />
}
