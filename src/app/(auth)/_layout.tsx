import { Stack } from 'expo-router'

export default function AuthLayout() {
  'use no memo'
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgot" options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}
