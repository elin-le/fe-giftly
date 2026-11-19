import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import { ensureObject } from '@/api/ensureObject'
import type { UserStatus } from '@/features/auth/types'
import type { Category } from '@/features/products/types'
import type { AnalyticsStats, DashboardStats } from '../analytics/types'
import type { AdminCustomer, AdminReview, CategoryInput } from '../management/types'

export const adminApi = {
  dashboard: () => apiClient.get<unknown>('/admin/dashboard').then((res) => ensureObject<DashboardStats>(res.data, ['kpis', 'revenueByDay'])),

  analytics: (days: number) =>
    apiClient.get<unknown>('/admin/analytics', { params: { days } }).then((res) => ensureObject<AnalyticsStats>(res.data, ['revenueByDay', 'topProducts'])),

  createCategory: (input: CategoryInput) => apiClient.post<Category>('/categories', input).then((res) => res.data),
  updateCategory: (id: string, input: CategoryInput) => apiClient.put<Category>(`/categories/${id}`, input).then((res) => res.data),
  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`).then(() => undefined),

  customers: () => apiClient.get<unknown>('/admin/customers').then((res) => ensureArray<AdminCustomer>(res.data)),
  setCustomerStatus: (id: string, status: UserStatus) => apiClient.patch<AdminCustomer>(`/admin/customers/${id}/status`, { status }).then((res) => res.data),

  reviews: () => apiClient.get<unknown>('/admin/reviews').then((res) => ensureArray<AdminReview>(res.data)),
  deleteReview: (id: string) => apiClient.delete(`/admin/reviews/${id}`).then(() => undefined),
}
