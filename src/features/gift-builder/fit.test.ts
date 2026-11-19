import { getFitStatus, computeFill, formatDimensions, formatWeight, toGrams, toVolumeMm3 } from './fit'

const box = { inner: { length: 20, width: 20, height: 10, unit: 'CM' as const }, maxWeight: { value: 2, unit: 'KG' as const } }
const item = (cm: number, grams: number, quantity = 1) => ({
  dimensions: { length: cm, width: cm, height: cm, unit: 'CM' as const }, weight: { value: grams, unit: 'G' as const }, quantity,
})

describe('đổi đơn vị', () => {
  it('khối lượng về gram', () => {
    expect(toGrams({ value: 1.5, unit: 'KG' })).toBe(1500)
    expect(toGrams({ value: 80, unit: 'G' })).toBe(80)
  })

  it('thể tích về mm³ với MM, CM, M', () => {
    expect(toVolumeMm3({ length: 1, width: 1, height: 1, unit: 'CM' })).toBe(1000)
    expect(toVolumeMm3({ length: 10, width: 10, height: 10, unit: 'MM' })).toBe(1000)
    expect(toVolumeMm3({ length: 1, width: 1, height: 1, unit: 'M' })).toBe(1e9)
  })
})

describe('computeFill', () => {
  it('hộp trống: 0%', () => {
    expect(computeFill(box, [])).toMatchObject({ count: 0, ratio: 0, isOver: false })
  })

  it('lấy chỉ số chặt nhất (khối lượng 1,5/2 kg = 75%)', () => {
    const fill = computeFill(box, [item(5, 1500)])
    expect(fill.ratio).toBeCloseTo(0.75)
    expect(fill.isOver).toBe(false)
  })

  it('quá tải trọng', () => {
    expect(computeFill(box, [item(5, 1200, 2)]).isOver).toBe(true)
  })

  it('tổng thể tích lớn hơn lòng hộp (4000 cm³)', () => {
    expect(computeFill(box, [item(10, 1, 5)]).isOver).toBe(true)
    expect(computeFill(box, [item(10, 1, 4)]).isOver).toBe(false)
  })

  it('thiếu số đo thì chỉ giới hạn theo số món', () => {
    expect(computeFill({ inner: null, maxWeight: null }, [{ dimensions: null, weight: null, quantity: 5 }])).toMatchObject({ isOver: false, ratio: 5 / 30 })
    expect(computeFill(null, [{ dimensions: null, weight: null, quantity: 31 }]).isOver).toBe(true)
  })
})

describe('định dạng', () => {
  it('kích thước và khối lượng', () => {
    expect(formatDimensions({ length: 22, width: 22, height: 10, unit: 'CM' })).toBe('22 × 22 × 10 cm')
    expect(formatWeight({ value: 2.5, unit: 'KG' })).toMatch(/2,5 kg/)
    expect(formatWeight({ value: 300, unit: 'G' })).toBe('300 g')
  })
})

describe('getFitStatus', () => {
  const box = { inner: { length: 10, width: 10, height: 10, unit: 'CM' as const }, maxWeight: { value: 1, unit: 'KG' as const } }
  const item = (cm: number, quantity = 1) => ({ dimensions: { length: cm, width: cm, height: cm, unit: 'CM' as const }, weight: null, quantity })

  it('rỗng, vừa, thiếu món', () => {
    expect(getFitStatus(computeFill(box, []))).toBe('EMPTY')
    expect(getFitStatus(computeFill(box, [item(8)]))).toBe('OK')
    expect(getFitStatus(computeFill(box, [item(3)]))).toBe('UNDER')
  })

  it('vượt nhẹ cần admin duyệt, vượt quá dung sai thì từ chối', () => {
    expect(getFitStatus(computeFill(box, [item(10, 1), item(4)]))).toBe('OVER_REVIEW')
    expect(getFitStatus(computeFill(box, [item(10, 2)]))).toBe('OVER_LIMIT')
  })

  it('hộp không có số đo thì không nhắc/không chặn', () => {
    expect(getFitStatus(computeFill({ inner: null, maxWeight: null }, [item(50)]))).toBe('OK')
  })
})
