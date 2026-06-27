import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, getOrderSummary, getOrderDetail, acceptOrder, rejectOrder, markDelivered, reportDeliveryIssue } from '@/api/orders'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn:  getOrders,
    staleTime: 30_000,
  })
}

export function useOrderSummary() {
  return useQuery({
    queryKey: ['orders-summary'],
    queryFn:  getOrderSummary,
    staleTime: 30_000,
  })
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => getOrderDetail(orderId),
    enabled:  !!orderId,
    staleTime: 15_000,
  })
}

export function useAcceptOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => acceptOrder(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['orders-summary'] })
    },
  })
}

export function useRejectOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      rejectOrder(orderId, reason),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['orders-summary'] })
    },
  })
}

export function useMarkDelivered() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => markDelivered(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['orders-summary'] })
    },
  })
}

export function useReportDeliveryIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      reportDeliveryIssue(orderId, reason),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
