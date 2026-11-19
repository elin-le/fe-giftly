import type { OrderStatus, PaymentMethod } from '@/features/orders/types'
import type { ProductType } from '@/features/products/types'

export interface DailyPoint {
  /** YYYY-MM-DD (múi giờ UTC). */
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string
  name: string
  units: number
  revenue: number
}

export interface LowStockVariant {
  variantId: string
  productId: string
  productName: string
  label: string | null
  sku: string
  stockQuantity: number
}

export interface DashboardStats {
  kpis: {
    revenue: number
    previousRevenue: number
    orders: number
    previousOrders: number
    averageOrderValue: number
    customers: number
    newCustomers: number
    pendingOrders: number
    pendingGiftBoxRequests: number
    lowStockVariants: number
  }
  revenueByDay: DailyPoint[]
  statusBreakdown: Array<{ status: OrderStatus; count: number }>
  topProducts: TopProduct[]
  lowStock: LowStockVariant[]
  recentOrders: Array<{ id: string; orderNumber: string; customerName: string; totalAmount: number; status: OrderStatus; orderedAt: string }>
}

export interface AnalyticsStats {
  days: number
  revenueByDay: DailyPoint[]
  revenueByCategory: Array<{ categoryId: string; name: string; revenue: number }>
  revenueByProductType: Array<{ productType: ProductType; revenue: number }>
  paymentMethods: Array<{ method: PaymentMethod; orders: number; amount: number }>
  ordersByWeekday: Array<{ weekday: number; orders: number }>
  topProducts: TopProduct[]
  customers: { newCustomers: number; returningCustomers: number }
  cancellationRate: number
  giftBoxes: { total: number; pendingReview: number; approved: number; rejected: number }
}

export const ANALYTICS_RANGES = [7, 30, 90] as const
