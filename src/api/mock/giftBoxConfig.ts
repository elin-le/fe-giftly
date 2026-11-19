import { getItemRole, isComplimentaryInBox } from '@/features/gift-builder/componentRole'
import { MESSAGE_MAX_LENGTH } from '@/features/gift-builder/constants'
import { computeFill, getFitStatus } from '@/features/gift-builder/fit'
import type { GiftBoxLine, GiftBoxPayload, GiftBoxReviewStatus, GiftBoxView } from '@/features/gift-builder/types'
import { mergePolicies } from '@/features/products/policy'
import { getVariantLabel } from '@/features/products/productRules'
import { MESSAGE_RENDERING_METHODS } from '@/features/products/types'
import { describeVariant, findVariantRef, type VariantRef } from './catalogView'
import { newId, type MockDb } from './db'
import { fail, type MockReply } from './http'

type Result = { view: GiftBoxView } | { reply: MockReply }
const rejected = (status: number, message: string): Result => ({ reply: fail(status, message) })

const toLine = (ref: VariantRef, role: GiftBoxLine['role'], quantity: number, unitPrice: number, extra: Partial<GiftBoxLine> = {}): GiftBoxLine => ({
  variantId: ref.variant.id, productId: ref.product.id, productName: ref.product.name,
  optionLabel: getVariantLabel(ref.product, ref.variant), productType: ref.product.productType, role,
  listPrice: ref.variant.price, unitPrice, isComplimentary: unitPrice === 0, quantity,
  messageText: null, messageRenderingMethod: null, ...extra,
})

/** Kiểm tra payload `gift_box_config` và dựng bản xem có giá do server tính. Chưa lưu gì vào DB. */
export function buildGiftBoxView(db: MockDb, payload: GiftBoxPayload, existingId?: string): Result {
  const boxRef = findVariantRef(db, payload.boxVariantId)
  if (!boxRef || boxRef.product.productType !== 'READY_MADE_GIFT_BOX') return rejected(400, 'Hộp quà không hợp lệ')

  const inputs = Array.isArray(payload.items) ? payload.items : []
  if (inputs.length === 0) return rejected(400, 'Hộp quà chưa có món nào')
  if (new Set(inputs.map((input) => input.productVariantId)).size !== inputs.length) return rejected(400, 'Món bị trùng trong hộp quà')

  const items: GiftBoxLine[] = []
  const fitItems = []
  for (const input of inputs) {
    const ref = findVariantRef(db, input.productVariantId)
    if (!ref) return rejected(400, 'Có món không thể đưa vào hộp quà')
    const { productType, isCustomBoxEligible } = ref.product
    if (productType === 'READY_MADE_GIFT_SET') return rejected(400, 'Không thể đặt set quà vào hộp tùy chỉnh')
    if (productType === 'REGULAR' && !isCustomBoxEligible) return rejected(400, `"${ref.product.name}" không dùng được cho hộp tùy chỉnh`)
    if (!Number.isInteger(input.quantity) || input.quantity < 1) return rejected(400, 'Số lượng món không hợp lệ')

    const message = input.messageText?.trim() ?? ''
    if (message.length > MESSAGE_MAX_LENGTH) return rejected(400, `Lời chúc tối đa ${MESSAGE_MAX_LENGTH} ký tự`)
    if (message && productType !== 'GREETING_CARD') return rejected(400, 'Chỉ thiệp mới có lời chúc')
    if (input.messageRenderingMethod && !MESSAGE_RENDERING_METHODS.includes(input.messageRenderingMethod)) return rejected(400, 'Cách thể hiện lời chúc không hợp lệ')

    const unitPrice = isComplimentaryInBox(productType) ? 0 : ref.variant.price
    items.push(toLine(ref, getItemRole(productType), input.quantity, unitPrice, message
      ? { messageText: message, messageRenderingMethod: input.messageRenderingMethod ?? 'HANDWRITTEN' }
      : {}))
    fitItems.push({ dimensions: ref.variant.dimensions, weight: ref.variant.weight, quantity: input.quantity })
  }

  const fill = computeFill(boxRef.variant.giftBoxDetail, fitItems)
  const fitStatus = getFitStatus(fill)
  if (fitStatus === 'OVER_LIMIT') return rejected(400, 'Các món vượt quá xa sức chứa của hộp, vui lòng bớt món hoặc chọn hộp lớn hơn')
  const needsReview = fitStatus === 'OVER_REVIEW'

  const demand = new Map<string, number>([[boxRef.variant.id, 1]])
  for (const item of items) demand.set(item.variantId, (demand.get(item.variantId) ?? 0) + item.quantity)
  for (const [variantId, quantity] of demand) {
    const ref = findVariantRef(db, variantId)!
    if (ref.product.status !== 'AVAILABLE' || ref.variant.status !== 'AVAILABLE' || ref.variant.stockQuantity === 0) return rejected(409, `"${describeVariant(ref)}" đã hết hàng`)
    if (quantity > ref.variant.stockQuantity) return rejected(409, `"${describeVariant(ref)}" chỉ còn ${ref.variant.stockQuantity} sản phẩm`)
  }

  const box = toLine(boxRef, 'BOX', 1, boxRef.variant.price)
  const price = [box, ...items].reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const policy = mergePolicies([boxRef.variant.policy, ...items.map((item) => findVariantRef(db, item.variantId)?.variant.policy)])
  const reviewStatus: GiftBoxReviewStatus = needsReview ? 'PENDING' : 'NOT_REQUIRED'
  const reviewNote = needsReview ? `Vượt sức chứa khoảng ${Math.round(((fill.capacityRatio ?? 1) - 1) * 100)}% — cần admin xem xét và liên hệ khách.` : null
  return {
    view: {
      id: existingId ?? newId(), box, items, price, returnPolicy: policy.returnPolicy, advancePaymentPercent: policy.advancePaymentPercent,
      reviewStatus, reviewNote, capacityRatio: fill.capacityRatio,
    },
  }
}
