import { apiClient } from '@/api/client'
import { ensureObject } from '@/api/ensureObject'
import type { Cart, SelectionInput } from '../types'

const toCart = (data: unknown): Cart => ensureObject<Cart>(data, ['items', 'subtotal', 'totalAmount', 'requiredAdvanceAmount'])

/** Giỏ hàng thuộc về người dùng đang đăng nhập; mọi hàm đều trả giỏ hàng mới nhất. */
export const cartApi = {
  get: () => apiClient.get<unknown>('/cart').then((res) => toCart(res.data)),

  addVariant: (productVariantId: string, quantity: number, selections: SelectionInput[] = []) =>
    apiClient.post<unknown>('/cart/items', { productVariantId, quantity, selections }).then((res) => toCart(res.data)),

  addGiftBox: (giftBoxConfigId: string) =>
    apiClient.post<unknown>('/cart/items', { giftBoxConfigId, quantity: 1 }).then((res) => toCart(res.data)),

  setQuantity: (itemId: string, quantity: number) =>
    apiClient.patch<unknown>(`/cart/items/${itemId}`, { quantity }).then((res) => toCart(res.data)),

  removeItem: (itemId: string) => apiClient.delete<unknown>(`/cart/items/${itemId}`).then((res) => toCart(res.data)),
}
