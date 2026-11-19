import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import { ensureObject } from '@/api/ensureObject'
import type { CreateOrderPayload, Order, OrderStatus } from '../types'

const toOrder = (data: unknown): Order => ensureObject<Order>(data, ['id', 'orderNumber', 'items', 'payments'])

export const ordersApi = {
  /** Đơn của người dùng hiện tại. */
  listMine: () => apiClient.get<unknown>('/orders/mine').then((res) => ensureArray<Order>(res.data)),

  /** Tất cả đơn (ADMIN). */
  list: () => apiClient.get<unknown>('/orders').then((res) => ensureArray<Order>(res.data)),

  /** Tạo đơn từ giỏ hàng hiện tại của người dùng. */
  create: (payload: CreateOrderPayload) =>
    apiClient.post<unknown>('/orders', payload).then((res) => toOrder(res.data)),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<unknown>(`/orders/${id}/status`, { status }).then((res) => toOrder(res.data)),
}
