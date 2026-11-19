import { Badge, type BadgeProps } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../types'

const STATUS_TONES: Record<OrderStatus, NonNullable<BadgeProps['tone']>> = {
  PENDING_CONFIRMATION: 'accent',
  CONFIRMED: 'neutral',
  PROCESSING: 'neutral',
  PACKAGING: 'neutral',
  READY_TO_SHIP: 'neutral',
  SHIPPING: 'neutral',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  RETURN_REQUESTED: 'accent',
  RETURNED: 'danger',
  FAILED: 'danger',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}
