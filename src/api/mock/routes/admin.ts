import type MockAdapter from 'axios-mock-adapter'
import { validateCategory } from '@/features/admin/management/categoryRules'
import type { AdminCustomer, AdminReview, CategoryInput } from '@/features/admin/management/types'
import { USER_STATUSES, type UserStatus } from '@/features/auth/types'
import type { MockDb } from '../db'
import { fail, lastSegment, parseBody, withAdmin } from '../http'
import { buildAnalytics, buildDashboard } from '../stats'
import { newId } from '../db'

const VALID_RANGES = [7, 30, 90]

function toCustomers(db: MockDb): AdminCustomer[] {
  return db.users
    .filter((user) => !user.roles.includes('ROLE_ADMIN'))
    .map((user) => {
      const orders = db.orders.filter((order) => order.userId === user.id)
      const paid = orders.filter((order) => !['CANCELLED', 'RETURNED', 'FAILED'].includes(order.status))
      return {
        id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status,
        orderCount: orders.length, totalSpent: paid.reduce((sum, order) => sum + order.totalAmount, 0),
        lastOrderAt: orders.map((o) => o.orderedAt).sort().at(-1) ?? null,
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

/** Dashboard, phân tích, danh mục, khách hàng, đánh giá — chỉ dành cho ROLE_ADMIN. */
export function registerAdminRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onGet('/admin/dashboard').reply(withAdmin(db, () => [200, buildDashboard(db)]))

  mock.onGet('/admin/analytics').reply(
    withAdmin(db, (_admin, config) => {
      const days = Number((config.params as { days?: number } | undefined)?.days ?? 30)
      return VALID_RANGES.includes(days) ? [200, buildAnalytics(db, days)] : fail(400, 'Khoảng thời gian phải là 7, 30 hoặc 90 ngày')
    }),
  )

  mock.onPost('/categories').reply(
    withAdmin(db, (_admin, config) => {
      const input = parseBody<CategoryInput>(config)
      const problem = validateCategory(input, db.categories)
      if (problem) return fail(400, problem)
      const created = { id: newId(), name: input.name.trim(), description: input.description?.trim() || null }
      db.categories.push(created)
      return [201, created]
    }),
  )

  mock.onPut(/\/categories\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = lastSegment(config.url)
      if (!db.categories.some((c) => c.id === id)) return fail(404, 'Không tìm thấy danh mục')
      const input = parseBody<CategoryInput>(config)
      const problem = validateCategory(input, db.categories.filter((c) => c.id !== id))
      if (problem) return fail(400, problem)
      const updated = { id, name: input.name.trim(), description: input.description?.trim() || null }
      db.categories = db.categories.map((c) => (c.id === id ? updated : c))
      return [200, updated]
    }),
  )

  mock.onDelete(/\/categories\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = lastSegment(config.url)
      if (!db.categories.some((c) => c.id === id)) return fail(404, 'Không tìm thấy danh mục')
      const used = db.products.filter((p) => p.categoryId === id).length
      if (used > 0) return fail(409, `Danh mục đang có ${used} sản phẩm, hãy chuyển sản phẩm sang danh mục khác trước`)
      db.categories = db.categories.filter((c) => c.id !== id)
      return [204]
    }),
  )

  mock.onGet('/admin/customers').reply(withAdmin(db, () => [200, toCustomers(db)]))

  mock.onPatch(/\/admin\/customers\/[^/]+\/status$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = config.url?.split('/')[3] ?? ''
      const { status } = parseBody<{ status: UserStatus }>(config)
      const user = db.users.find((candidate) => candidate.id === id)
      if (!user || user.roles.includes('ROLE_ADMIN')) return fail(404, 'Không tìm thấy khách hàng')
      if (!USER_STATUSES.includes(status)) return fail(400, 'Trạng thái không hợp lệ')
      user.status = status
      return [200, toCustomers(db).find((c) => c.id === id)]
    }),
  )

  mock.onGet('/admin/reviews').reply(
    withAdmin(db, () => {
      const names = new Map(db.products.map((p) => [p.id, p.name]))
      const reviews: AdminReview[] = [...db.reviews]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((review) => ({ ...review, productName: names.get(review.productId) ?? '—' }))
      return [200, reviews]
    }),
  )

  mock.onDelete(/\/admin\/reviews\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = lastSegment(config.url)
      if (!db.reviews.some((r) => r.id === id)) return fail(404, 'Không tìm thấy đánh giá')
      db.reviews = db.reviews.filter((r) => r.id !== id)
      return [204]
    }),
  )
}
