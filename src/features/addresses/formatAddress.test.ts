import { formatAddress } from './formatAddress'

describe('formatAddress', () => {
  it('nối các phần có giá trị', () => {
    expect(formatAddress({ addressLine: '12 Lê Lợi', ward: null, district: 'Quận 1', city: 'TP.HCM' })).toBe('12 Lê Lợi, Quận 1, TP.HCM')
  })
  it('chỉ có dòng địa chỉ', () => {
    expect(formatAddress({ addressLine: '12 Lê Lợi', ward: null, district: null, city: null })).toBe('12 Lê Lợi')
  })
})
