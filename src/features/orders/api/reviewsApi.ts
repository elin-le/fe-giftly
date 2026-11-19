import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import { ensureObject } from '@/api/ensureObject'
import type { Review, ReviewPayload } from '../types'

export const reviewsApi = {
  /** Đánh giá công khai của một sản phẩm (gộp mọi biến thể). */
  listForProduct: (productId: string) =>
    apiClient.get<unknown>(`/products/${productId}/reviews`).then((res) => ensureArray<Review>(res.data)),

  mine: () => apiClient.get<unknown>('/reviews/mine').then((res) => ensureArray<Review>(res.data)),

  create: (payload: ReviewPayload) =>
    apiClient.post<unknown>('/reviews', payload).then((res) => ensureObject<Review>(res.data, ['id', 'rating'])),
}
