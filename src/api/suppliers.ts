import { apiClient } from './client'
import type { Supplier, Product, Brand, Unit } from '@/types'
import { DEMO_MODE } from '@/config/demo'
import {
  mockGetSuppliers,
  mockGetSupplierProducts,
  mockGetProductBrands,
  mockGetProductUnits,
} from './mock'

export async function getSuppliers(): Promise<Supplier[]> {
  if (DEMO_MODE) return mockGetSuppliers()
  const res = await apiClient.get<{ success: true; data: Supplier[] }>('/suppliers')
  return res.data.data
}

export async function getSupplierProducts(supplierId: number): Promise<Product[]> {
  if (DEMO_MODE) return mockGetSupplierProducts(supplierId)
  const res = await apiClient.get<{ success: true; data: Product[] }>(`/suppliers/${supplierId}/products`)
  return res.data.data
}

export async function getProductBrands(supplierId: number, productId: number): Promise<Brand[]> {
  if (DEMO_MODE) return mockGetProductBrands(supplierId, productId)
  const res = await apiClient.get<{ success: true; data: Brand[] }>(
    `/suppliers/${supplierId}/products/${productId}/brands`,
  )
  return res.data.data
}

export async function getProductUnits(supplierId: number, productId: number): Promise<Unit[]> {
  if (DEMO_MODE) return mockGetProductUnits(supplierId, productId)
  const res = await apiClient.get<{ success: true; data: Unit[] }>(
    `/suppliers/${supplierId}/products/${productId}/units`,
  )
  return res.data.data
}
