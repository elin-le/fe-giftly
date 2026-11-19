import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import { ensureObject } from '@/api/ensureObject'
import type { GiftBoxPayload, GiftBoxRequest, GiftBoxReviewDecision, GiftBoxView } from '../types'

const VIEW_KEYS = ['id', 'box', 'items', 'price'] as const

export const giftBoxApi = {
  /** Lưu cấu hình hộp (`gift_box_config`); server kiểm tra thành phần, tồn kho và tính giá. */
  create: (payload: GiftBoxPayload) =>
    apiClient.post<unknown>('/gift-box-configs', payload).then((res) => ensureObject<GiftBoxView>(res.data, VIEW_KEYS)),

  get: (id: string) =>
    apiClient.get<unknown>(`/gift-box-configs/${id}`).then((res) => ensureObject<GiftBoxView>(res.data, VIEW_KEYS)),

  /** Khách chỉnh yêu cầu của mình; bị từ chối (409) sau khi admin đã duyệt. */
  update: (id: string, payload: GiftBoxPayload) =>
    apiClient.put<unknown>(`/gift-box-configs/${id}`, payload).then((res) => ensureObject<GiftBoxView>(res.data, VIEW_KEYS)),

  /** Admin: các hộp vượt kích thước cần xem xét. */
  listRequests: () =>
    apiClient.get<unknown>('/admin/gift-box-requests').then((res) => ensureArray<GiftBoxRequest>(res.data)),

  decide: (id: string, decision: GiftBoxReviewDecision) =>
    apiClient.patch<GiftBoxRequest>(`/admin/gift-box-requests/${id}`, decision).then((res) => res.data),
}
