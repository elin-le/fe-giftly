import type MockAdapter from 'axios-mock-adapter'
import { canReviewOrder } from '@/features/orders/orderRules'
import type { Review, ReviewPayload } from '@/features/orders/types'
import { newId, type MockDb } from '../db'
import { fail, parseBody, withUser } from '../http'

export function registerReviewRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onGet('/reviews/mine').reply(withUser(db, (user) => [200, db.reviews.filter((review) => review.userId === user.id)]))

  mock.onGet(/\/products\/[^/]+\/reviews$/).reply((config) => {
    const productId = config.url?.split('/')[2] ?? ''
    return [200, db.reviews.filter((review) => review.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))]
  })

  mock.onPost('/reviews').reply(
    withUser(db, (user, config) => {
      const { orderItemId, orderItemComponentId, rating, title, comment } = parseBody<ReviewPayload>(config)
      if (Boolean(orderItemId) === Boolean(orderItemComponentId)) return fail(400, 'Cần chọn đúng một nguồn mua hàng để đánh giá')
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(400, 'Điểm đánh giá phải từ 1 đến 5')

      const order = db.orders.find((candidate) =>
        candidate.items.some((item) => item.id === orderItemId || item.components.some((c) => c.id === orderItemComponentId)),
      )
      if (!order || order.userId !== user.id) return fail(404, 'Không tìm thấy sản phẩm đã mua')
      if (!canReviewOrder(order)) return fail(409, 'Chỉ đơn đã giao hoặc hoàn thành mới được đánh giá')

      const item = order.items.find((candidate) => candidate.id === orderItemId)
      const component = order.items.flatMap((candidate) => candidate.components).find((candidate) => candidate.id === orderItemComponentId)
      const source = item ?? component
      const productId = item?.productId ?? component?.productId
      if (!source || !productId) return fail(400, 'Mục này không thể đánh giá')
      if (db.reviews.some((review) => (orderItemId ? review.orderItemId === orderItemId : review.orderItemComponentId === orderItemComponentId))) {
        return fail(409, 'Bạn đã đánh giá mục này rồi')
      }

      const review: Review = {
        id: newId(), userId: user.id, userName: user.fullName, productId, productVariantId: source.productVariantId,
        orderItemId: orderItemId ?? null, orderItemComponentId: orderItemComponentId ?? null, rating,
        title: title?.trim() || null, comment: comment?.trim() || null, createdAt: new Date().toISOString(),
      }
      db.reviews.unshift(review)
      return [201, review]
    }),
  )
}
