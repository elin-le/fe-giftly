import type { GiftBoxRequest, GiftBoxReviewDecision } from '@/features/gift-builder/types'
import type { GiftBoxPayload } from '@/features/gift-builder/types'
import type { OrderItem } from '@/features/orders/types'
import { calcAdvanceAmount } from '@/features/products/policy'
import { findVariantRef } from './catalogView'
import type { MockDb, MockGiftBoxConfig } from './db'
import { buildGiftBoxView } from './giftBoxConfig'
import { fail, type MockReply } from './http'
import { componentsForGiftBox } from './orderFlow'
import { adjustStock, collectDemand } from './stock'

const needsAttention = (config: MockGiftBoxConfig) => config.view.reviewStatus !== 'NOT_REQUIRED'

function findOrderOf(db: MockDb, configId: string) {
  return db.orders.find((order) => order.items.some((item) => item.giftBoxConfigId === configId))
}

/** Yêu cầu cần xem xét (chờ duyệt lên đầu), kèm thông tin khách và đơn để admin liên hệ. */
export function listRequests(db: MockDb): GiftBoxRequest[] {
  const rank = { PENDING: 0, REJECTED: 1, APPROVED: 2, NOT_REQUIRED: 3 } as const
  return db.giftBoxConfigs
    .filter(needsAttention)
    .flatMap((config): GiftBoxRequest[] => {
      const user = db.users.find((candidate) => candidate.id === config.userId)
      if (!user) return []
      const detail = findVariantRef(db, config.view.box.variantId)?.variant.giftBoxDetail
      const order = findOrderOf(db, config.view.id)
      return [{
        id: config.view.id,
        customer: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
        view: config.view, inner: detail?.inner ?? null, maxWeight: detail?.maxWeight ?? null,
        orderId: order?.id ?? null, orderNumber: order?.orderNumber ?? null, updatedAt: config.updatedAt,
      }]
    })
    .sort((a, b) => rank[a.view.reviewStatus] - rank[b.view.reviewStatus] || b.updatedAt.localeCompare(a.updatedAt))
}

/** Khách sửa hộp: chỉ khi admin chưa duyệt và (nếu đã đặt) đơn còn chờ xác nhận; đơn được chốt lại snapshot. */
export function updateConfig(db: MockDb, userId: string, configId: string, payload: GiftBoxPayload): MockReply {
  const config = db.giftBoxConfigs.find((candidate) => candidate.view.id === configId && candidate.userId === userId)
  if (!config) return fail(404, 'Không tìm thấy hộp quà tùy chỉnh')
  if (config.view.reviewStatus === 'APPROVED') return fail(409, 'Yêu cầu đã được duyệt nên không thể chỉnh sửa')
  const order = findOrderOf(db, configId)
  if (order && order.status !== 'PENDING_CONFIRMATION') return fail(409, 'Đơn hàng đã được xử lý nên không thể chỉnh sửa hộp quà')

  // Đơn đã trừ kho: hoàn kho phần cũ trước để kiểm tra phần mới, lỗi thì trừ lại.
  const oldDemand = order ? collectDemand(db, [{ id: 'x', variantId: null, giftBoxConfigId: configId, quantity: 1, selections: [] }]) : null
  if (oldDemand) adjustStock(db, oldDemand, 1)
  const result = buildGiftBoxView(db, payload, configId)
  if ('reply' in result) {
    if (oldDemand) adjustStock(db, oldDemand, -1)
    return result.reply
  }
  config.view = result.view
  config.updatedAt = new Date().toISOString()

  if (order) {
    const newDemand = collectDemand(db, [{ id: 'x', variantId: null, giftBoxConfigId: configId, quantity: 1, selections: [] }])
    adjustStock(db, newDemand, -1)
    const total = db.orderDemand.get(order.id) ?? new Map<string, number>()
    for (const [id, qty] of oldDemand ?? []) total.set(id, (total.get(id) ?? 0) - qty)
    for (const [id, qty] of newDemand) total.set(id, (total.get(id) ?? 0) + qty)
    db.orderDemand.set(order.id, total)
    resnapshotOrder(db, order.id, configId)
  }
  return [200, config.view]
}

function resnapshotOrder(db: MockDb, orderId: string, configId: string): void {
  db.orders = db.orders.map((order) => {
    if (order.id !== orderId) return order
    const view = db.giftBoxConfigs.find((c) => c.view.id === configId)!.view
    const items: OrderItem[] = order.items.map((item) =>
      item.giftBoxConfigId === configId
        ? { ...item, unitPrice: view.price, subtotal: view.price, components: componentsForGiftBox(db, view),
            returnPolicySnapshot: view.returnPolicy, advancePaymentPercentSnapshot: view.advancePaymentPercent || null,
            requiredAdvanceAmount: calcAdvanceAmount(view.price, view.advancePaymentPercent) || null }
        : item,
    )
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const totalAmount = subtotal + order.shippingFee
    const advance = items.reduce((sum, item) => sum + (item.requiredAdvanceAmount ?? 0), 0)
    const method = order.payments[0]?.paymentMethod ?? 'BANK_TRANSFER'
    const pay = (paymentStage: 'ADVANCE_PAYMENT' | 'REMAINING_PAYMENT' | 'FULL_PAYMENT', amount: number) =>
      ({ id: crypto.randomUUID(), paymentMethod: method, paymentStatus: 'PENDING' as const, paymentStage, amount, paidAt: null })
    const payments = order.payments.every((p) => p.paymentStatus === 'PENDING')
      ? advance > 0 ? [pay('ADVANCE_PAYMENT', advance), pay('REMAINING_PAYMENT', totalAmount - advance)] : [pay('FULL_PAYMENT', totalAmount)]
      : order.payments
    return { ...order, items, subtotal, totalAmount, requiredAdvanceAmount: advance || null, payments }
  })
}

export function decideRequest(db: MockDb, configId: string, body: GiftBoxReviewDecision): MockReply {
  const config = db.giftBoxConfigs.find((candidate) => candidate.view.id === configId)
  if (!config || !needsAttention(config)) return fail(404, 'Không tìm thấy yêu cầu hộp quà')
  if (body.decision !== 'APPROVED' && body.decision !== 'REJECTED') return fail(400, 'Quyết định không hợp lệ')
  const note = body.note?.trim() || null
  if (body.decision === 'REJECTED' && !note) return fail(400, 'Vui lòng ghi lý do để khách chỉnh lại')
  config.view = { ...config.view, reviewStatus: body.decision, reviewNote: note ?? config.view.reviewNote }
  return [200, listRequests(db).find((request) => request.id === configId)]
}
