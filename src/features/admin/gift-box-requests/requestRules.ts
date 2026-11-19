import type { GiftBoxRequest, GiftBoxReviewStatus } from '@/features/gift-builder/types'

export const REVIEW_STATUS_LABELS: Record<GiftBoxReviewStatus, string> = {
  NOT_REQUIRED: 'Không cần duyệt',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

export const REVIEW_STATUS_COLORS: Record<GiftBoxReviewStatus, 'default' | 'warning' | 'success' | 'error'> = {
  NOT_REQUIRED: 'default',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

/** "+15%" hoặc "—" khi hộp thiếu số đo. */
export const formatOverflow = (ratio: number | null): string => (ratio === null ? '—' : `${ratio > 1 ? '+' : ''}${Math.round((ratio - 1) * 100)}%`)

export const countPending = (requests: readonly GiftBoxRequest[]): number => requests.filter((r) => r.view.reviewStatus === 'PENDING').length

/** Link Zalo theo số điện thoại khách (bỏ ký tự không phải số); null nếu không có số. */
export function getZaloLink(phone: string | null): string | null {
  const digits = phone?.replace(/\D/g, '') ?? ''
  return digits.length >= 9 ? `https://zalo.me/${digits}` : null
}
