import { Badge } from '@/components/ui/badge'
import type { GiftBoxReviewStatus } from '../types'

const LABELS: Record<Exclude<GiftBoxReviewStatus, 'NOT_REQUIRED'>, { text: string; tone: 'accent' | 'success' | 'danger' }> = {
  PENDING: { text: 'Chờ Giftly duyệt', tone: 'accent' },
  APPROVED: { text: 'Đã duyệt', tone: 'success' },
  REJECTED: { text: 'Cần chỉnh lại', tone: 'danger' },
}

/** Trạng thái xét duyệt hộp vượt kích thước; không hiển thị nếu hộp vừa vặn. */
export function ReviewStatusBadge({ status }: { status: GiftBoxReviewStatus }) {
  if (status === 'NOT_REQUIRED') return null
  const { text, tone } = LABELS[status]
  return <Badge tone={tone}>{text}</Badge>
}
