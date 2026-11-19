import { getNextStatuses, isFinalStatus, isRestockingStatus } from './orderStatus'
import { ORDER_STATUSES, type OrderStatus } from './types'

describe('orderStatus', () => {
  it('đi theo luồng chính từ chờ xác nhận đến hoàn thành', () => {
    const path: OrderStatus[] = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'PACKAGING', 'READY_TO_SHIP', 'SHIPPING', 'DELIVERED', 'COMPLETED']
    path.slice(0, -1).forEach((status, index) => expect(getNextStatuses(status)).toContain(path[index + 1]))
  })

  it('chỉ huỷ được trước khi giao cho đơn vị vận chuyển', () => {
    for (const status of ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'PACKAGING'] as const) {
      expect(getNextStatuses(status)).toContain('CANCELLED')
    }
    for (const status of ['READY_TO_SHIP', 'SHIPPING', 'DELIVERED'] as const) {
      expect(getNextStatuses(status)).not.toContain('CANCELLED')
    }
  })

  it('đang vận chuyển có thể giao thất bại; đã giao có thể bị yêu cầu trả hàng', () => {
    expect(getNextStatuses('SHIPPING')).toEqual(['DELIVERED', 'FAILED'])
    expect(getNextStatuses('DELIVERED')).toEqual(['COMPLETED', 'RETURN_REQUESTED'])
    expect(getNextStatuses('RETURN_REQUESTED')).toEqual(['RETURNED', 'COMPLETED'])
  })

  it('hoàn thành / huỷ / đã trả / thất bại là trạng thái cuối', () => {
    for (const status of ['COMPLETED', 'CANCELLED', 'RETURNED', 'FAILED'] as const) expect(isFinalStatus(status)).toBe(true)
    expect(isFinalStatus('PENDING_CONFIRMATION')).toBe(false)
  })

  it('không trạng thái nào chuyển về chính nó, và mọi trạng thái đều tới được từ chờ xác nhận', () => {
    const reachable = new Set<OrderStatus>(['PENDING_CONFIRMATION'])
    const queue: OrderStatus[] = ['PENDING_CONFIRMATION']
    for (const status of queue) {
      expect(getNextStatuses(status)).not.toContain(status)
      for (const next of getNextStatuses(status)) if (!reachable.has(next)) { reachable.add(next); queue.push(next) }
    }
    expect([...reachable].sort()).toEqual([...ORDER_STATUSES].sort())
  })

  it('huỷ, giao thất bại, trả hàng thì hoàn kho', () => {
    expect(['CANCELLED', 'FAILED', 'RETURNED'].every((s) => isRestockingStatus(s as OrderStatus))).toBe(true)
    expect(isRestockingStatus('COMPLETED')).toBe(false)
  })
})
