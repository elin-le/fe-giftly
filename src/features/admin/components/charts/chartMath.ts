export interface Point {
  x: number
  y: number
}

/** Quy đổi giá trị về toạ độ SVG trong khung `width × height` (gốc trên-trái, trục y hướng xuống) và chừa lề `padding`. */
export function toPoints(values: readonly number[], width: number, height: number, padding = 8): Point[] {
  const max = Math.max(...values, 0)
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  return values.map((value, index) => ({
    x: padding + (values.length <= 1 ? innerW / 2 : (index / (values.length - 1)) * innerW),
    y: padding + innerH - (max === 0 ? 0 : (value / max) * innerH),
  }))
}

export const toLinePath = (points: readonly Point[]): string => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

/** Đường khép kín xuống đáy để tô vùng dưới đường biểu đồ. */
export function toAreaPath(points: readonly Point[], height: number, padding = 8): string {
  if (points.length === 0) return ''
  const first = points[0]!
  const last = points[points.length - 1]!
  return `${toLinePath(points)} L${last.x.toFixed(1)},${height - padding} L${first.x.toFixed(1)},${height - padding} Z`
}

/** Phần trăm thay đổi so với kỳ trước; `null` khi kỳ trước bằng 0 (không so sánh được). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** Góc (độ) của từng lát bánh theo tỷ lệ; tổng bằng 0 thì trả về mảng rỗng. */
export function toSlices(values: readonly number[]): Array<{ start: number; end: number }> {
  const total = values.reduce((sum, v) => sum + v, 0)
  if (total <= 0) return []
  let angle = 0
  return values.map((value) => {
    const start = angle
    angle += (value / total) * 360
    return { start, end: angle }
  })
}

/** Rút gọn số tiền cho trục/nhãn: 1.250.000 → "1,3tr"; 2.400.000.000 → "2,4tỷ". */
export function compactCurrency(amount: number): string {
  const abs = Math.abs(amount)
  const format = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
  if (abs >= 1e9) return `${format(amount / 1e9)}tỷ`
  if (abs >= 1e6) return `${format(amount / 1e6)}tr`
  if (abs >= 1e3) return `${format(amount / 1e3)}k`
  return String(amount)
}
