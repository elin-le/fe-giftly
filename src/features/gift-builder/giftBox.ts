import { MESSAGE_MAX_LENGTH, MAX_CONTENT_ITEMS } from './constants'
import { isComplimentaryInBox } from './componentRole'
import { computeFill, getFitStatus, type Fill, type FitStatus } from './fit'
import { entryName, type VariantEntry } from './catalog'
import { mergePolicies, type MergedPolicy } from '@/features/products/policy'
import { isVariantPurchasable } from '@/features/products/productRules'
import type { MessageRenderingMethod } from '@/features/products/types'
import type { BoxChoice, BoxItem, GiftBoxDraft, GiftBoxPayload, GiftBoxView } from './types'

export const EMPTY_DRAFT: GiftBoxDraft = { box: null, items: [] }

export const toBoxChoice = (entry: VariantEntry): BoxChoice => ({
  variantId: entry.variant.id,
  productId: entry.product.id,
  productName: entryName(entry),
  optionLabel: entry.label,
  price: entry.variant.price,
  stockQuantity: entry.variant.stockQuantity,
  inner: entry.variant.giftBoxDetail?.inner ?? null,
  maxWeight: entry.variant.giftBoxDetail?.maxWeight ?? null,
  policy: entry.variant.policy,
})

export const toBoxItem = (entry: VariantEntry, quantity: number, previous?: BoxItem): BoxItem => ({
  variantId: entry.variant.id,
  productId: entry.product.id,
  productName: entryName(entry),
  optionLabel: entry.label,
  productType: entry.product.productType,
  listPrice: entry.variant.price,
  stockQuantity: entry.variant.stockQuantity,
  quantity,
  dimensions: entry.variant.dimensions,
  weight: entry.variant.weight,
  policy: entry.variant.policy,
  messageText: previous?.messageText ?? '',
  messageRenderingMethod: previous?.messageRenderingMethod ?? 'HANDWRITTEN',
})

/** Giá khách phải trả cho một món: phụ kiện đóng gói miễn phí (nhưng vẫn trừ kho). */
export const getItemPrice = (item: Pick<BoxItem, 'productType' | 'listPrice'>): number =>
  isComplimentaryInBox(item.productType) ? 0 : item.listPrice

export const countItems = (items: readonly Pick<BoxItem, 'quantity'>[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0)

/** Số món quà thật sự (không tính phụ kiện và thiệp). */
export const countContent = (draft: GiftBoxDraft): number =>
  countItems(draft.items.filter((item) => item.productType !== 'PACKAGING_ACCESSORY' && item.productType !== 'GREETING_CARD'))

export const getItemQuantity = (draft: GiftBoxDraft, variantId: string): number =>
  draft.items.find((item) => item.variantId === variantId)?.quantity ?? 0

/** Giá hộp = giá hộp chứa + Σ giá (đã miễn phí phụ kiện) × số lượng; khớp cách server tính. */
export const calcGiftBoxTotal = (draft: GiftBoxDraft): number =>
  (draft.box?.price ?? 0) + draft.items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)

export const getFill = (draft: GiftBoxDraft): Fill => computeFill(draft.box, draft.items)

/** Chính sách tổng hợp của hộp (không đổi trả nếu có món không đổi trả; đặt cọc theo tỷ lệ cao nhất). */
export const getDraftPolicy = (draft: GiftBoxDraft): MergedPolicy =>
  mergePolicies([draft.box?.policy, ...draft.items.map((item) => item.policy)])

/** Chọn hộp chứa; chọn lại hộp đang chọn thì giữ nguyên. */
export function chooseBox(draft: GiftBoxDraft, entry: VariantEntry): GiftBoxDraft {
  if (!isVariantPurchasable(entry.variant) || entry.product.status !== 'AVAILABLE') return draft
  return { ...draft, box: toBoxChoice(entry) }
}

/**
 * Đặt số lượng một món, tự giới hạn theo tồn kho, số món tối đa và sức chứa của hộp (khối lượng, thể tích);
 * về 0 (hoặc không hợp lệ) thì bỏ món.
 */
export function setItemQuantity(draft: GiftBoxDraft, entry: VariantEntry, quantity: number): GiftBoxDraft {
  if (!isVariantPurchasable(entry.variant) || entry.product.status !== 'AVAILABLE') return draft

  const current = draft.items.find((item) => item.variantId === entry.variant.id)
  const others = draft.items.filter((item) => item.variantId !== entry.variant.id)
  const wanted = Number.isFinite(quantity) ? Math.min(Math.max(Math.trunc(quantity), 0), entry.variant.stockQuantity) : 0

  for (let next = wanted; next > 0; next--) {
    const items = [...others, toBoxItem(entry, next, current)]
    if (getFitStatus(computeFill(draft.box, items)) !== 'OVER_LIMIT') {
      return { ...draft, items: current ? draft.items.map((item) => (item.variantId === entry.variant.id ? items[items.length - 1]! : item)) : items }
    }
  }
  return { ...draft, items: others }
}

export const addItem = (draft: GiftBoxDraft, entry: VariantEntry): GiftBoxDraft =>
  setItemQuantity(draft, entry, getItemQuantity(draft, entry.variant.id) + 1)

/** Bật/tắt một món số lượng 1 (phụ kiện, thiệp). */
export const toggleItem = (draft: GiftBoxDraft, entry: VariantEntry): GiftBoxDraft =>
  setItemQuantity(draft, entry, getItemQuantity(draft, entry.variant.id) > 0 ? 0 : 1)

/** Đặt lời chúc và cách thể hiện cho một thiệp trong hộp. */
export function setCardMessage(
  draft: GiftBoxDraft, variantId: string, patch: { messageText?: string; messageRenderingMethod?: MessageRenderingMethod },
): GiftBoxDraft {
  return {
    ...draft,
    items: draft.items.map((item) =>
      item.variantId === variantId && item.productType === 'GREETING_CARD'
        ? {
            ...item,
            ...(patch.messageText !== undefined && { messageText: patch.messageText.slice(0, MESSAGE_MAX_LENGTH) }),
            ...(patch.messageRenderingMethod && { messageRenderingMethod: patch.messageRenderingMethod }),
          }
        : item,
    ),
  }
}

export const getDraftFitStatus = (draft: GiftBoxDraft): FitStatus => getFitStatus(getFill(draft))

/** Lời nhắc không chặn: thiếu món so với thể tích hộp, hoặc vượt nhẹ nên admin sẽ xem xét. */
export function getDraftNotice(draft: GiftBoxDraft): { tone: 'info' | 'warning'; text: string } | null {
  const status = getDraftFitStatus(draft)
  if (status === 'UNDER') return { tone: 'info', text: 'Hộp còn trống khá nhiều — bạn có thể thêm món, hoặc chọn hộp nhỏ hơn cho vừa vặn.' }
  if (status === 'OVER_REVIEW') return { tone: 'warning', text: 'Các món hơi vượt sức chứa của hộp. Bạn vẫn có thể thêm vào giỏ; Giftly sẽ xem xét và liên hệ để xác nhận. Bạn có thể chỉnh sửa cho tới khi được duyệt.' }
  return null
}

/**
 * Dựng bản nháp từ cấu hình đã lưu để khách chỉnh sửa. Bỏ qua giới hạn sức chứa (cấu hình đã được server chấp nhận)
 * và món đã ngừng bán/không còn trong danh mục.
 */
export function draftFromView(view: GiftBoxView, entries: readonly VariantEntry[]): GiftBoxDraft {
  const find = (variantId: string) => entries.find((entry) => entry.variant.id === variantId)
  const boxEntry = find(view.box.variantId)
  const items = view.items.flatMap((line) => {
    const entry = find(line.variantId)
    if (!entry) return []
    const item = toBoxItem(entry, line.quantity)
    return [{ ...item, messageText: line.messageText ?? '', messageRenderingMethod: line.messageRenderingMethod ?? item.messageRenderingMethod }]
  })
  return { box: boxEntry ? toBoxChoice(boxEntry) : null, items }
}

/** Danh sách lỗi ngăn việc hoàn tất hộp quà; rỗng nghĩa là hợp lệ. */
export function getDraftIssues(draft: GiftBoxDraft): string[] {
  if (!draft.box) return ['Chưa chọn hộp quà.']

  const issues: string[] = []
  if (countContent(draft) === 0) issues.push('Hộp quà chưa có món nào.')
  if (countItems(draft.items) > MAX_CONTENT_ITEMS) issues.push(`Hộp chỉ chứa tối đa ${MAX_CONTENT_ITEMS} món.`)
  if (getFitStatus(getFill(draft)) === 'OVER_LIMIT') issues.push('Các món vượt quá xa sức chứa của hộp — hãy bớt món hoặc chọn hộp lớn hơn.')
  for (const item of draft.items) {
    if (item.quantity > item.stockQuantity) issues.push(`"${item.productName}" chỉ còn ${item.stockQuantity} sản phẩm.`)
    if (item.messageText.length > MESSAGE_MAX_LENGTH) issues.push(`Lời chúc tối đa ${MESSAGE_MAX_LENGTH} ký tự.`)
  }
  return issues
}

/** Chuyển bản nháp thành payload gửi server; `null` nếu còn lỗi. Không gửi giá — server tự tính. */
export function toPayload(draft: GiftBoxDraft): GiftBoxPayload | null {
  if (!draft.box || getDraftIssues(draft).length > 0) return null
  return {
    boxVariantId: draft.box.variantId,
    items: draft.items.map((item) => {
      const message = item.productType === 'GREETING_CARD' ? item.messageText.trim() : ''
      return {
        productVariantId: item.variantId,
        quantity: item.quantity,
        ...(message && { messageText: message, messageRenderingMethod: item.messageRenderingMethod }),
      }
    }),
  }
}
