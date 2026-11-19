import { ORDER_STATUSES } from '@/features/orders/types'
import { orderStatusColor } from './orderStatusColor'

describe('orderStatusColor', () => {
  it('mọi trạng thái đều có màu', () => ORDER_STATUSES.forEach((s) => expect(orderStatusColor(s)).toBeTruthy()))
  it('nhóm chính', () => {
    expect(orderStatusColor('PENDING_CONFIRMATION')).toBe('warning')
    expect(orderStatusColor('SHIPPING')).toBe('info')
    expect(orderStatusColor('COMPLETED')).toBe('success')
    expect(orderStatusColor('CANCELLED')).toBe('error')
  })
})
