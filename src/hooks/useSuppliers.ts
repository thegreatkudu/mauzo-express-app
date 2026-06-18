import { useQuery } from '@tanstack/react-query'
import { getSuppliers, getSupplierProducts, getProductBrands, getProductUnits } from '@/api/suppliers'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn:  getSuppliers,
    staleTime: 5 * 60_000,
  })
}

export function useSupplierProducts(supplierId: number) {
  return useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn:  () => getSupplierProducts(supplierId),
    enabled:  supplierId > 0,
    staleTime: 2 * 60_000,
  })
}

export function useProductBrands(supplierId: number, productId: number) {
  return useQuery({
    queryKey: ['product-brands', supplierId, productId],
    queryFn:  () => getProductBrands(supplierId, productId),
    enabled:  supplierId > 0 && productId > 0,
  })
}

export function useProductUnits(supplierId: number, productId: number) {
  return useQuery({
    queryKey: ['product-units', supplierId, productId],
    queryFn:  () => getProductUnits(supplierId, productId),
    enabled:  supplierId > 0 && productId > 0,
  })
}
