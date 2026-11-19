import { filterCustomers } from './customerRules'
import type { AdminCustomer } from './types'

const make = (over: Partial<AdminCustomer>): AdminCustomer => ({ id: 'u', fullName: 'Nguyễn Văn An', email: 'an@x.vn', phone: '0901234567', status: 'ACTIVE', orderCount: 0, totalSpent: 0, lastOrderAt: null, ...over })

describe('filterCustomers', () => {
  const list = [make({ id: '1' }), make({ id: '2', fullName: 'Lê Hoa', email: 'hoa@x.vn', phone: null })]
  it('rỗng hoặc toàn khoảng trắng → tất cả', () => {
    expect(filterCustomers(list, '   ')).toHaveLength(2)
  })
  it('tìm không phân biệt dấu/hoa thường, theo tên, email, điện thoại', () => {
    expect(filterCustomers(list, 'NGUYEN').map((c) => c.id)).toEqual(['1'])
    expect(filterCustomers(list, 'hoa@').map((c) => c.id)).toEqual(['2'])
    expect(filterCustomers(list, '0901').map((c) => c.id)).toEqual(['1'])
  })
  it('không khớp → rỗng', () => {
    expect(filterCustomers(list, 'zzz')).toEqual([])
  })
})
