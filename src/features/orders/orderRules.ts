import type { Order, OrderItem, OrderItemComponent, Payment, Review } from './types'

/** Chỉ đơn đã giao / hoàn thành mới được đánh giá. */
export const canReviewOrder = (order: Pick<Order, 'status'>): boolean =>
  order.status === 'DELIVERED' || order.status === 'COMPLETED'

/** Cả dòng không đổi trả nếu chính nó hoặc bất kỳ thành phần nào không đổi trả. */
export const isItemNoReturn = (item: Pick<OrderItem, 'returnPolicySnapshot' | 'components'>): boolean =>
  item.returnPolicySnapshot === 'NO_RETURN' ||
  item.components.some((component) => component.returnPolicySnapshot === 'NO_RETURN')

export const hasReviewForItem = (reviews: readonly Review[], item: Pick<OrderItem, 'id'>): boolean =>
  reviews.some((review) => review.orderItemId === item.id)

export const hasReviewForComponent = (reviews: readonly Review[], component: Pick<OrderItemComponent, 'id'>): boolean =>
  reviews.some((review) => review.orderItemComponentId === component.id)

export const sumPaid = (payments: readonly Payment[]): number =>
  payments.filter((payment) => payment.paymentStatus === 'PAID').reduce((sum, payment) => sum + payment.amount, 0)

/** Số tiền khách còn phải trả (các khoản đang chờ thanh toán). */
export const sumPending = (payments: readonly Payment[]): number =>
  payments.filter((payment) => payment.paymentStatus === 'PENDING').reduce((sum, payment) => sum + payment.amount, 0)
