import type { Cart, CartItem } from '@/features/cart/types'
import type { GiftBoxView } from '@/features/gift-builder/types'
import { getNextStatuses, isRestockingStatus } from '@/features/orders/orderStatus'
import { isItemNoReturn } from '@/features/orders/orderRules'
import {
  PAYMENT_METHODS,
  type CreateOrderPayload,
  type Order,
  type OrderItem,
  type OrderItemComponent,
  type OrderStatus,
  type Payment,
} from '@/features/orders/types'
import { getVariantAttributes } from '@/features/products/productRules'
import type { ComponentRole, ProductVariant, VariantPolicy } from '@/features/products/types'
import { buildCartView } from './cartView'
import { findVariantRef, resolveProducts } from './catalogView'
import type { SeedUser } from './data'
import { getCart, newId, type MockCartLine, type MockDb } from './db'
import { fail, toAddress, type MockReply } from './http'
import { adjustStock, collectDemand, findStockProblem } from './stock'

interface ComponentSource {
  variantId: string
  role: ComponentRole
  quantity: number
  unitPrice: number
  isComplimentary: boolean
  messageText?: string | null
  messageRenderingMethod?: OrderItemComponent['messageRenderingMethod']
}

/** Snapshot một thành phần: tên, SKU, thuộc tính, giá và chính sách tại thời điểm đặt (không đọc lại sau này). */
function toComponent(db: MockDb, source: ComponentSource): OrderItemComponent {
  const ref = findVariantRef(db, source.variantId)!
  const policy: VariantPolicy | null = ref.variant.policy
  return {
    id: newId(), productVariantId: ref.variant.id, productId: ref.product.id, componentRole: source.role,
    productNameSnapshot: ref.product.name, skuSnapshot: ref.variant.sku, variantSnapshot: toAttributes(ref.product, ref.variant),
    quantity: source.quantity, unitPrice: source.unitPrice, isComplimentary: source.isComplimentary,
    messageText: source.messageText ?? null, messageRenderingMethod: source.messageRenderingMethod ?? null,
    returnPolicySnapshot: policy?.returnPolicy ?? null, advancePaymentPercentSnapshot: policy?.advancePaymentPercent ?? null,
    isPerishableSnapshot: policy?.isPerishable ?? null, shelfLifeHoursSnapshot: policy?.shelfLifeHours ?? null,
  }
}

const toAttributes = (product: Parameters<typeof getVariantAttributes>[0], variant: Pick<ProductVariant, 'optionValueIds'>) => {
  const attributes = getVariantAttributes(product, variant)
  return Object.keys(attributes).length > 0 ? attributes : null
}

/** Snapshot các thành phần của hộp quà tùy chỉnh. */
export function componentsForGiftBox(db: MockDb, view: GiftBoxView): OrderItemComponent[] {
  return [view.box, ...view.items].map((entry) =>
    toComponent(db, {
      variantId: entry.variantId, role: entry.role, quantity: entry.quantity, unitPrice: entry.unitPrice,
      isComplimentary: entry.isComplimentary, messageText: entry.messageText, messageRenderingMethod: entry.messageRenderingMethod,
    }),
  )
}

function componentsOf(db: MockDb, item: CartItem, line: MockCartLine): OrderItemComponent[] {
  if (item.giftBox) return componentsForGiftBox(db, item.giftBox)

  const resolved = resolveProducts(db).flatMap((p) => p.variants).find((v) => v.id === item.variant.id)
  const fixed = (resolved?.bundle?.components ?? []).map((component) =>
    // Thành phần cố định đã nằm trong giá set; chỉ phụ kiện được ghi nhận là miễn phí.
    toComponent(db, { variantId: component.variantId, role: component.componentRole, quantity: component.quantity, unitPrice: 0, isComplimentary: component.componentRole === 'ACCESSORY' }),
  )
  const options = (resolved?.bundle?.optionGroups ?? []).flatMap((group) => group.options)
  const chosen = line.selections.flatMap((selection) => {
    const option = options.find((candidate) => candidate.id === selection.bundleOptionId)
    if (!option) return []
    return [toComponent(db, {
      variantId: option.variantId, role: option.productType === 'GREETING_CARD' ? 'GREETING_CARD' : 'ACCESSORY', quantity: selection.quantity ?? 1,
      unitPrice: option.price, isComplimentary: option.price === 0,
      messageText: selection.messageText, messageRenderingMethod: selection.messageRenderingMethod,
    })]
  })
  return [...fixed, ...chosen]
}

function toOrderItem(db: MockDb, item: CartItem, line: MockCartLine): OrderItem {
  const base = {
    id: newId(), unitPrice: item.unitPrice, quantity: item.quantity, subtotal: item.subtotal,
    returnPolicySnapshot: item.returnPolicy, advancePaymentPercentSnapshot: item.advancePaymentPercent || null,
    requiredAdvanceAmount: item.advanceAmount || null, components: componentsOf(db, item, line),
  }
  if (item.giftBox) {
    const policies = base.components.map((c) => c.shelfLifeHoursSnapshot)
    return {
      ...base, productVariantId: null, productId: null, giftBoxConfigId: item.giftBox.id, itemNameSnapshot: 'Hộp quà tùy chỉnh',
      skuSnapshot: null, variantSnapshot: null, isPerishableSnapshot: base.components.some((c) => c.isPerishableSnapshot),
      shelfLifeHoursSnapshot: policies.filter((h): h is number => h !== null).sort((a, b) => a - b)[0] ?? null,
    }
  }
  const ref = findVariantRef(db, item.variant.id)!
  return {
    ...base, productVariantId: ref.variant.id, productId: ref.product.id, giftBoxConfigId: null, itemNameSnapshot: ref.product.name,
    skuSnapshot: ref.variant.sku, variantSnapshot: toAttributes(ref.product, ref.variant),
    isPerishableSnapshot: ref.variant.policy?.isPerishable ?? false, shelfLifeHoursSnapshot: ref.variant.policy?.shelfLifeHours ?? null,
  }
}

const orderNumber = (sequence: number): string => `GFT-${String(sequence).padStart(4, '0')}`

/** Cọc + phần còn lại khi có đặt cọc; ngược lại thanh toán toàn bộ một lần. */
function buildPayments(payload: CreateOrderPayload, total: number, advance: number): Payment[] {
  const payment = (paymentStage: Payment['paymentStage'], amount: number): Payment => ({
    id: newId(), paymentMethod: payload.paymentMethod, paymentStatus: 'PENDING', paymentStage, amount, paidAt: null,
  })
  return advance > 0 ? [payment('ADVANCE_PAYMENT', advance), payment('REMAINING_PAYMENT', total - advance)] : [payment('FULL_PAYMENT', total)]
}

function buildOrder(db: MockDb, user: SeedUser, payload: CreateOrderPayload, cart: Cart, lines: MockCartLine[]): Order {
  const address = db.addresses.find((candidate) => candidate.id === payload.addressId)!
  return {
    id: newId(), userId: user.id, customer: { id: user.id, fullName: user.fullName, email: user.email }, address: toAddress(address),
    orderNumber: orderNumber(++db.orderSeq), subtotal: cart.subtotal, shippingFee: cart.shippingFee, totalAmount: cart.totalAmount,
    requiredAdvanceAmount: cart.requiredAdvanceAmount || null, status: 'PENDING_CONFIRMATION', orderedAt: new Date().toISOString(),
    items: cart.items.map((item) => toOrderItem(db, item, lines.find((line) => line.id === item.id)!)),
    payments: buildPayments(payload, cart.totalAmount, cart.requiredAdvanceAmount),
  }
}

/** Tạo đơn từ giỏ hàng của người dùng: kiểm tra, trừ kho (gộp theo biến thể), chốt snapshot, làm trống giỏ. */
export function placeOrder(db: MockDb, user: SeedUser, payload: CreateOrderPayload): MockReply {
  if (!PAYMENT_METHODS.includes(payload.paymentMethod)) return fail(400, 'Phương thức thanh toán không hợp lệ')
  if (!db.addresses.some((a) => a.id === payload.addressId && a.userId === user.id)) return fail(400, 'Địa chỉ giao hàng không hợp lệ')

  const cart = buildCartView(db, user.id)
  if (cart.items.length === 0) return fail(400, 'Giỏ hàng đang trống')
  // Quy định v1: đơn cần đặt cọc phải thanh toán cọc trước, không cho COD để tránh bỏ qua khoản cọc.
  if (cart.requiredAdvanceAmount > 0 && payload.paymentMethod === 'COD') return fail(400, 'Đơn hàng cần đặt cọc, không áp dụng thanh toán COD')

  const lines = getCart(db, user.id).items
  const demand = collectDemand(db, lines)
  const problem = findStockProblem(db, demand)
  if (problem) return fail(409, problem)

  const order = buildOrder(db, user, payload, cart, lines)
  adjustStock(db, demand, -1)
  db.orderDemand.set(order.id, demand)
  getCart(db, user.id).items = []
  db.orders.unshift(order)
  return [201, order]
}

const paid = (payment: Payment): Payment => ({ ...payment, paymentStatus: 'PAID', paidAt: new Date().toISOString() })

/**
 * Hệ quả lên thanh toán theo trạng thái đơn:
 * - Xác nhận: khoản cọc / toàn bộ của phương thức không phải COD được ghi nhận đã thanh toán.
 * - Đã giao / hoàn thành: mọi khoản còn lại (kể cả COD) đã thanh toán.
 * - Huỷ / giao thất bại / trả hàng: khoản đã trả → hoàn tiền; khoản chờ → thất bại.
 */
function settlePayments(payments: Payment[], status: OrderStatus): Payment[] {
  return payments.map((payment) => {
    if (status === 'CONFIRMED' && payment.paymentStatus === 'PENDING' && payment.paymentMethod !== 'COD' && payment.paymentStage !== 'REMAINING_PAYMENT') return paid(payment)
    if ((status === 'DELIVERED' || status === 'COMPLETED') && payment.paymentStatus === 'PENDING') return paid(payment)
    if (status === 'CANCELLED' || status === 'FAILED' || status === 'RETURNED') {
      if (payment.paymentStatus === 'PAID') return { ...payment, paymentStatus: 'REFUNDED' }
      if (payment.paymentStatus === 'PENDING') return { ...payment, paymentStatus: 'FAILED' }
    }
    return payment
  })
}

/** Cập nhật trạng thái đơn (chỉ theo luồng hợp lệ); huỷ / giao thất bại / trả hàng hoàn lại kho. */
const hasUnapprovedGiftBox = (db: MockDb, order: Order): boolean =>
  order.items.some((item) => {
    const view = db.giftBoxConfigs.find((c) => c.view.id === item.giftBoxConfigId)?.view
    return view !== undefined && (view.reviewStatus === 'PENDING' || view.reviewStatus === 'REJECTED')
  })

export function changeOrderStatus(db: MockDb, orderId: string, status: OrderStatus): MockReply {
  const current = db.orders.find((order) => order.id === orderId)
  if (!current) return fail(404, 'Không tìm thấy đơn hàng')
  if (!getNextStatuses(current.status).includes(status)) return fail(409, 'Không thể chuyển đơn hàng sang trạng thái này')
  if (status === 'CONFIRMED' && hasUnapprovedGiftBox(db, current)) {
    return fail(409, 'Đơn có hộp quà tùy chỉnh vượt kích thước chưa được duyệt. Hãy duyệt yêu cầu hộp quà trước khi xác nhận đơn.')
  }
  if (status === 'RETURN_REQUESTED' && current.items.every(isItemNoReturn)) return fail(409, 'Đơn hàng chỉ gồm sản phẩm không đổi trả')

  if (isRestockingStatus(status)) {
    const demand = db.orderDemand.get(orderId)
    if (demand) adjustStock(db, demand, 1)
    db.orderDemand.delete(orderId)
  }

  const updated: Order = { ...current, status, payments: settlePayments(current.payments, status) }
  db.orders = db.orders.map((order) => (order.id === orderId ? updated : order))
  return [200, updated]
}
