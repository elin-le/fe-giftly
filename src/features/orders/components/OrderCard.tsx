import { formatCurrency, formatDateTime } from '@/lib/format'
import { canReviewOrder } from '../orderRules'
import type { Order, Review } from '../types'
import { OrderItemList } from './OrderItemList'
import { OrderStatusBadge } from './OrderStatusBadge'
import { PaymentList } from './PaymentList'
import type { ReviewTarget } from './ReviewDialog'

interface OrderCardProps {
  order: Order
  reviews?: Review[]
  onReview?: (target: ReviewTarget) => void
}

export function OrderCard({ order, reviews = [], onReview }: OrderCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.orderedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderItemList items={order.items} review={onReview && canReviewOrder(order) ? { reviews, onReview } : undefined} />

      <footer className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <div className="flex justify-between gap-3 text-muted-foreground">
          <span>Phí vận chuyển</span>
          <span>{order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}</span>
        </div>
        <PaymentList payments={order.payments} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Tổng cộng</span>
          <strong className="text-lg">{formatCurrency(order.totalAmount)}</strong>
        </div>
      </footer>
    </article>
  )
}
