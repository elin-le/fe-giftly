import { compactCurrency, percentChange, toAreaPath, toLinePath, toPoints, toSlices } from './chartMath'

describe('toPoints', () => {
  it('giá trị lớn nhất nằm ở trên cùng, 0 ở đáy', () => {
    const [a, b] = toPoints([0, 10], 100, 50, 0)
    expect(a).toEqual({ x: 0, y: 50 })
    expect(b).toEqual({ x: 100, y: 0 })
  })
  it('toàn số 0 thì không chia cho 0; một điểm nằm giữa; rỗng thì rỗng', () => {
    expect(toPoints([0, 0], 100, 50, 0).every((p) => p.y === 50)).toBe(true)
    expect(toPoints([5], 100, 50, 0)[0]!.x).toBe(50)
    expect(toPoints([], 100, 50)).toEqual([])
  })
})

describe('đường dẫn', () => {
  it('đường và vùng tô', () => {
    const pts = toPoints([1, 2], 100, 50, 0)
    expect(toLinePath(pts)).toBe('M0.0,25.0 L100.0,0.0')
    expect(toAreaPath(pts, 50, 0)).toBe('M0.0,25.0 L100.0,0.0 L100.0,50 L0.0,50 Z')
    expect(toAreaPath([], 50)).toBe('')
  })
})

describe('percentChange', () => {
  it('tăng, giảm, kỳ trước bằng 0', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
    expect(percentChange(10, 0)).toBeNull()
  })
})

describe('toSlices', () => {
  it('chia theo tỷ lệ và phủ đủ 360°', () => {
    const slices = toSlices([1, 3])
    expect(slices[0]).toEqual({ start: 0, end: 90 })
    expect(slices[1]).toEqual({ start: 90, end: 360 })
  })
  it('tổng 0 thì rỗng', () => expect(toSlices([0, 0])).toEqual([]))
})

describe('compactCurrency', () => {
  it.each([[999, '999'], [1500, '1,5k'], [1_250_000, '1,3tr'], [2_400_000_000, '2,4tỷ']])('%i → %s', (n, text) => expect(compactCurrency(n)).toBe(text))
})
