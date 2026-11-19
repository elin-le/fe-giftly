import type { OrderStatus } from '@/features/orders/types'

export type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

/** Màu chip theo nhóm trạng thái: chờ = cam, đang xử lý = tím, xong = xanh, huỷ/lỗi = đỏ. */
export function orderStatusColor(status: OrderStatus): ChipColor {
  switch (status) {
    case 'PENDING_CONFIRMATION':
    case 'RETURN_REQUESTED':
      return 'warning'
    case 'CONFIRMED':
    case 'PROCESSING':
    case 'PACKAGING':
    case 'READY_TO_SHIP':
    case 'SHIPPING':
      return 'info'
    case 'DELIVERED':
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
    case 'FAILED':
    case 'RETURNED':
      return 'error'
  }
}
