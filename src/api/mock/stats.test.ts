import { createDb } from './db'
import { addDemoHistory } from './demoHistory'
import { buildAnalytics, buildDashboard, revenueByDay, topProducts } from './stats'

const NOW = new Date('2026-11-18T12:00:00.000Z').getTime()

describe('revenueByDay', () => {
  it('đủ số ngày, ngày không có đơn là 0, bỏ đơn huỷ', () => {
    const db = createDb()
    const base = db.orders[0]!
    const orders = [
      { ...base, orderedAt: '2026-11-18T01:00:00.000Z', status: 'COMPLETED' as const, totalAmount: 100 },
      { ...base, orderedAt: '2026-11-18T02:00:00.000Z', status: 'CANCELLED' as const, totalAmount: 999 },
      { ...base, orderedAt: '2026-11-16T02:00:00.000Z', status: 'SHIPPING' as const, totalAmount: 50 },
    ]
    const points = revenueByDay(orders, 3, NOW)
    expect(points.map((p) => p.date)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18'])
    expect(points.map((p) => p.revenue)).toEqual([50, 0, 100])
    expect(points.map((p) => p.orders)).toEqual([1, 0, 1])
  })
})

describe('topProducts', () => {
  it('gộp theo sản phẩm, sắp theo doanh thu, tôn trọng giới hạn', () => {
    const db = createDb()
    const top = topProducts(db.orders, 1)
    expect(top).toHaveLength(1)
    expect(top[0]!.revenue).toBeGreaterThan(0)
  })
})

describe('buildDashboard / buildAnalytics với dữ liệu demo', () => {
  const db = createDb()
  addDemoHistory(db, NOW)

  it('KPI nhất quán với biểu đồ doanh thu', () => {
    const stats = buildDashboard(db, NOW)
    expect(stats.revenueByDay).toHaveLength(30)
    expect(stats.kpis.orders).toBeGreaterThan(10)
    const chartTotal = stats.revenueByDay.reduce((sum, p) => sum + p.revenue, 0)
    expect(chartTotal).toBe(stats.kpis.revenue)
    expect(stats.kpis.averageOrderValue).toBeGreaterThan(0)
    expect(stats.topProducts.length).toBeLessThanOrEqual(5)
    expect(stats.recentOrders[0]!.orderedAt >= stats.recentOrders[1]!.orderedAt).toBe(true)
  })

  it('phân tích: tổng theo danh mục bằng tổng theo loại sản phẩm', () => {
    const stats = buildAnalytics(db, 90, NOW)
    const byCategory = stats.revenueByCategory.reduce((s, c) => s + c.revenue, 0)
    const byType = stats.revenueByProductType.reduce((s, c) => s + c.revenue, 0)
    expect(byCategory).toBe(byType)
    expect(stats.ordersByWeekday).toHaveLength(7)
    expect(stats.cancellationRate).toBeGreaterThanOrEqual(0)
    expect(stats.cancellationRate).toBeLessThan(1)
  })

  it('dữ liệu demo cố định (giống nhau mỗi lần)', () => {
    const other = createDb()
    addDemoHistory(other, NOW)
    expect(other.orders.map((o) => o.totalAmount)).toEqual(db.orders.map((o) => o.totalAmount))
  })
})
