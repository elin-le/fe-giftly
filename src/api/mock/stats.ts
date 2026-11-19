import type { AnalyticsStats, DailyPoint, DashboardStats, LowStockVariant, TopProduct } from '@/features/admin/analytics/types'
import type { Order, OrderStatus } from '@/features/orders/types'
import { getVariantLabel } from '@/features/products/productRules'
import type { MockDb } from './db'

const DAY_MS = 24 * 60 * 60 * 1000
const LOW_STOCK = 5
/** Đơn không tạo doanh thu. */
const NON_REVENUE: readonly OrderStatus[] = ['CANCELLED', 'RETURNED', 'FAILED']

const dayKey = (time: number): string => new Date(time).toISOString().slice(0, 10)
const earns = (order: Pick<Order, 'status'>): boolean => !NON_REVENUE.includes(order.status)
const inRange = (order: Order, from: number, to: number): boolean => {
  const at = new Date(order.orderedAt).getTime()
  return at >= from && at < to
}

/** Doanh thu và số đơn theo từng ngày trong `days` ngày kết thúc ở `now` (đủ mọi ngày, kể cả ngày không có đơn). */
export function revenueByDay(orders: readonly Order[], days: number, now: number): DailyPoint[] {
  const points = new Map<string, DailyPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(now - i * DAY_MS)
    points.set(date, { date, revenue: 0, orders: 0 })
  }
  for (const order of orders) {
    const point = points.get(dayKey(new Date(order.orderedAt).getTime()))
    if (!point || !earns(order)) continue
    point.revenue += order.totalAmount
    point.orders += 1
  }
  return [...points.values()]
}

export function topProducts(orders: readonly Order[], limit: number): TopProduct[] {
  const totals = new Map<string, TopProduct>()
  for (const order of orders.filter(earns)) {
    for (const item of order.items) {
      if (!item.productId) continue
      const current = totals.get(item.productId) ?? { productId: item.productId, name: item.itemNameSnapshot, units: 0, revenue: 0 }
      current.units += item.quantity
      current.revenue += item.subtotal
      totals.set(item.productId, current)
    }
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

function lowStockVariants(db: MockDb): LowStockVariant[] {
  return db.products
    .filter((product) => product.status !== 'DISCONTINUED')
    .flatMap((product) =>
      product.variants
        .filter((variant) => variant.status !== 'DISCONTINUED' && variant.stockQuantity <= LOW_STOCK)
        .map((variant) => ({ variantId: variant.id, productId: product.id, productName: product.name, label: getVariantLabel(product, variant), sku: variant.sku, stockQuantity: variant.stockQuantity })),
    )
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
}

const countCustomers = (db: MockDb) => db.users.filter((user) => user.roles.includes('ROLE_USER') && !user.roles.includes('ROLE_ADMIN'))

export function buildDashboard(db: MockDb, now = Date.now()): DashboardStats {
  const window = 30 * DAY_MS
  const current = db.orders.filter((o) => inRange(o, now - window, now + DAY_MS))
  const previous = db.orders.filter((o) => inRange(o, now - 2 * window, now - window))
  const revenue = current.filter(earns).reduce((sum, o) => sum + o.totalAmount, 0)
  const earning = current.filter(earns)
  const statuses = new Map<OrderStatus, number>()
  for (const order of current) statuses.set(order.status, (statuses.get(order.status) ?? 0) + 1)
  const firstOrderAt = (userId: string) => Math.min(...db.orders.filter((o) => o.userId === userId).map((o) => new Date(o.orderedAt).getTime()))

  return {
    kpis: {
      revenue,
      previousRevenue: previous.filter(earns).reduce((sum, o) => sum + o.totalAmount, 0),
      orders: current.length,
      previousOrders: previous.length,
      averageOrderValue: earning.length > 0 ? Math.round(revenue / earning.length) : 0,
      customers: countCustomers(db).length,
      newCustomers: countCustomers(db).filter((u) => firstOrderAt(u.id) >= now - window).length,
      pendingOrders: db.orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length,
      pendingGiftBoxRequests: db.giftBoxConfigs.filter((c) => c.view.reviewStatus === 'PENDING').length,
      lowStockVariants: lowStockVariants(db).length,
    },
    revenueByDay: revenueByDay(db.orders, 30, now),
    statusBreakdown: [...statuses].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
    topProducts: topProducts(current, 5),
    lowStock: lowStockVariants(db).slice(0, 6),
    recentOrders: [...db.orders]
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
      .slice(0, 6)
      .map((o) => ({ id: o.id, orderNumber: o.orderNumber, customerName: o.customer.fullName, totalAmount: o.totalAmount, status: o.status, orderedAt: o.orderedAt })),
  }
}

export function buildAnalytics(db: MockDb, days: number, now = Date.now()): AnalyticsStats {
  const orders = db.orders.filter((o) => inRange(o, now - days * DAY_MS, now + DAY_MS))
  const earning = orders.filter(earns)
  const productById = new Map(db.products.map((p) => [p.id, p]))
  const categoryNames = new Map(db.categories.map((c) => [c.id, c.name]))

  const byCategory = new Map<string, number>()
  const byType = new Map<string, number>()
  for (const order of earning) {
    for (const item of order.items) {
      const product = item.productId ? productById.get(item.productId) : undefined
      if (!product) continue
      byCategory.set(product.categoryId, (byCategory.get(product.categoryId) ?? 0) + item.subtotal)
      byType.set(product.productType, (byType.get(product.productType) ?? 0) + item.subtotal)
    }
  }

  const methods = new Map<string, { orders: number; amount: number }>()
  const weekdays = Array.from({ length: 7 }, () => 0)
  for (const order of earning) {
    const method = order.payments[0]?.paymentMethod ?? 'COD'
    const entry = methods.get(method) ?? { orders: 0, amount: 0 }
    methods.set(method, { orders: entry.orders + 1, amount: entry.amount + order.totalAmount })
    weekdays[new Date(order.orderedAt).getUTCDay()]! += 1
  }

  const buyers = new Set(orders.map((o) => o.userId))
  const returning = [...buyers].filter((id) => db.orders.some((o) => o.userId === id && new Date(o.orderedAt).getTime() < now - days * DAY_MS)).length
  const configs = db.giftBoxConfigs

  return {
    days,
    revenueByDay: revenueByDay(db.orders, days, now),
    revenueByCategory: [...byCategory].map(([categoryId, revenue]) => ({ categoryId, name: categoryNames.get(categoryId) ?? '—', revenue })).sort((a, b) => b.revenue - a.revenue),
    revenueByProductType: [...byType].map(([productType, revenue]) => ({ productType: productType as AnalyticsStats['revenueByProductType'][number]['productType'], revenue })).sort((a, b) => b.revenue - a.revenue),
    paymentMethods: [...methods].map(([method, v]) => ({ method: method as AnalyticsStats['paymentMethods'][number]['method'], ...v })).sort((a, b) => b.amount - a.amount),
    ordersByWeekday: weekdays.map((count, weekday) => ({ weekday, orders: count })),
    topProducts: topProducts(orders, 10),
    customers: { newCustomers: buyers.size - returning, returningCustomers: returning },
    cancellationRate: orders.length > 0 ? orders.filter((o) => o.status === 'CANCELLED').length / orders.length : 0,
    giftBoxes: {
      total: configs.length,
      pendingReview: configs.filter((c) => c.view.reviewStatus === 'PENDING').length,
      approved: configs.filter((c) => c.view.reviewStatus === 'APPROVED').length,
      rejected: configs.filter((c) => c.view.reviewStatus === 'REJECTED').length,
    },
  }
}
