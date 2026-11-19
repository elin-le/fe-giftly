import { countPending, formatOverflow, getZaloLink } from './requestRules'
import type { GiftBoxRequest } from '@/features/gift-builder/types'

describe('requestRules', () => {
  it('formatOverflow', () => {
    expect(formatOverflow(null)).toBe('—')
    expect(formatOverflow(1.15)).toBe('+15%')
    expect(formatOverflow(0.5)).toBe('-50%')
    expect(formatOverflow(1)).toBe('0%')
  })
  it('getZaloLink', () => {
    expect(getZaloLink('090 123 4567')).toBe('https://zalo.me/0901234567')
    expect(getZaloLink(null)).toBeNull()
    expect(getZaloLink('12')).toBeNull()
  })
  it('countPending chỉ đếm PENDING', () => {
    const r = (reviewStatus: string) => ({ view: { reviewStatus } }) as unknown as GiftBoxRequest
    expect(countPending([r('PENDING'), r('APPROVED'), r('PENDING'), r('REJECTED')])).toBe(2)
  })
})
