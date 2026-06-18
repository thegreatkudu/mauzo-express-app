import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationsRead } from '@/api/notifications'
import { useAuthStore } from '@/store/auth.store'

const POLL_MS = 60_000

export function useNotifications() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return useQuery({
    queryKey: ['notifications'],
    queryFn:  getNotifications,
    enabled:  isAuthenticated,
    staleTime: POLL_MS,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  })
}

export function useNotificationPolling() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    if (!isAuthenticated) return

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        qc.invalidateQueries({ queryKey: ['notifications'] })
      }
      appState.current = next
    })

    return () => sub.remove()
  }, [isAuthenticated, qc])
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => markNotificationsRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
