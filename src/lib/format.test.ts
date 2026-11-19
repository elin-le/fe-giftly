import { formatCurrency, formatDateTime } from './format'

describe('formatCurrency', () => {
  it('định dạng VND không có phần thập phân', () => {
    expect(formatCurrency(250000).replace(/\s| /g, '')).toBe('250.000₫')
  })

  it('xử lý số 0', () => {
    expect(formatCurrency(0).replace(/\s| /g, '')).toBe('0₫')
  })

  it('coi NaN / Infinity là 0', () => {
    expect(formatCurrency(Number.NaN).replace(/\s| /g, '')).toBe('0₫')
    expect(formatCurrency(Number.POSITIVE_INFINITY).replace(/\s| /g, '')).toBe('0₫')
  })
})

describe('formatDateTime', () => {
  it('trả về "—" khi ngày không hợp lệ', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('định dạng ngày hợp lệ', () => {
    expect(formatDateTime('2026-11-12T08:30:00.000Z')).toMatch(/2026/)
  })
})
