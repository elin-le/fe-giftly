import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import { ensureObject } from '@/api/ensureObject'
import type { Category, Product, ProductInput, ProductQuery } from '../types'

export const productsApi = {
  list: (query: ProductQuery = {}) =>
    apiClient.get<unknown>('/products', { params: query }).then((res) => ensureArray<Product>(res.data)),

  /** Sản phẩm bán chạy trong tháng. */
  featured: (limit = 8) =>
    apiClient.get<unknown>('/products/featured', { params: { limit } }).then((res) => ensureArray<Product>(res.data)),

  get: (id: string) =>
    apiClient.get<unknown>(`/products/${id}`).then((res) => ensureObject<Product>(res.data, ['id', 'variants'])),

  create: (input: ProductInput) => apiClient.post<Product>('/products', input).then((res) => res.data),

  update: (id: string, input: ProductInput) =>
    apiClient.put<Product>(`/products/${id}`, input).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/products/${id}`).then(() => undefined),

  categories: () => apiClient.get<unknown>('/categories').then((res) => ensureArray<Category>(res.data)),
}
