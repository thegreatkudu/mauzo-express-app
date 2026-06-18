import { ActivityIndicator, View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

export default function AuthIndex() {
  const isHydrated      = useAuthStore(s => s.isHydrated)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color='#CE4002' size='large' />
      </View>
    )
  }

  if (isAuthenticated) return <Redirect href='/(tabs)' />
  return <Redirect href='/(auth)/signin' />
}
