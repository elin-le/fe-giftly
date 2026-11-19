import type { OrderStatus } from './types'

/** Luồng xử lý: xác nhận → xử lý → đóng gói → sẵn sàng giao → vận chuyển → đã giao → hoàn thành; có nhánh huỷ, giao thất bại, trả hàng. */
const NEXT_STATUSES: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKAGING', 'CANCELLED'],
  PACKAGING: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPING'],
  SHIPPING: ['DELIVERED', 'FAILED'],
  DELIVERED: ['COMPLETED', 'RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  RETURNED: [],
  FAILED: [],
}

/** Trạng thái làm hàng được hoàn lại kho. */
const RESTOCKING_STATUSES: readonly OrderStatus[] = ['CANCELLED', 'FAILED', 'RETURNED']

/** Các trạng thái mà đơn hàng được phép chuyển tới từ trạng thái hiện tại. */
export function getNextStatuses(current: OrderStatus): readonly OrderStatus[] {
  return NEXT_STATUSES[current]
}

export function isFinalStatus(status: OrderStatus): boolean {
  return NEXT_STATUSES[status].length === 0
}

/** Đơn chuyển sang trạng thái này thì hàng quay lại kho. */
export function isRestockingStatus(status: OrderStatus): boolean {
  return RESTOCKING_STATUSES.includes(status)
}
