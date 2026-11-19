import { useAsync } from '@/lib/useAsync'
import { productsApi } from '../api/productsApi'
import type { ProductQuery } from '../types'

export function useProducts(query: ProductQuery) {
  return useAsync(() => productsApi.list(query), [query.search, query.categoryId, query.productType])
}

export function useCategories() {
  return useAsync(() => productsApi.categories(), [])
}

export function useProduct(id: string | undefined) {
  return useAsync(() => productsApi.get(id ?? ''), [id])
}

export function useFeaturedProducts(limit = 8) {
  return useAsync(() => productsApi.featured(limit), [limit])
}
