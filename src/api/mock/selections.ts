import type { SelectionInput } from '@/features/cart/types'
import { MESSAGE_MAX_LENGTH } from '@/features/gift-builder/constants'
import { MESSAGE_RENDERING_METHODS, type BundleOption, type ProductVariant } from '@/features/products/types'
import { findVariantRef, resolveProducts } from './catalogView'
import type { MockDb } from './db'

export type SelectionResult = { selections: SelectionInput[] } | { error: string }

/** Tuỳ chọn của set (đã suy ra giá/tồn kho) theo id. */
export function findBundleOption(db: MockDb, variant: ProductVariant, optionId: string): BundleOption | undefined {
  const resolved = resolveProducts(db).flatMap((p) => p.variants).find((candidate) => candidate.id === variant.id)
  return resolved?.bundle?.optionGroups.flatMap((group) => group.options).find((option) => option.id === optionId)
}

/**
 * Kiểm tra các lựa chọn của khách với cấu trúc bundle của biến thể và chuẩn hoá (số lượng 1, lời nhắn đã cắt khoảng trắng).
 * Biến thể không phải set thì không được kèm lựa chọn.
 */
export function normalizeSelections(db: MockDb, variantId: string, raw: unknown): SelectionResult {
  const input = Array.isArray(raw) ? (raw as SelectionInput[]) : []
  const ref = findVariantRef(db, variantId)
  if (!ref) return { error: 'Sản phẩm không tồn tại' }
  const groups = ref.variant.bundle?.optionGroups ?? []
  if (!ref.variant.bundle && input.length > 0) return { error: 'Sản phẩm này không có lựa chọn kèm theo' }

  const resolved = resolveProducts(db).flatMap((p) => p.variants).find((candidate) => candidate.id === variantId)
  const options = (resolved?.bundle?.optionGroups ?? []).flatMap((group) => group.options.map((option) => ({ group, option })))

  const selections: SelectionInput[] = []
  for (const selection of input) {
    const match = options.find(({ option }) => option.id === selection.bundleOptionId)
    if (!match) return { error: 'Lựa chọn không hợp lệ' }
    if (selection.quantity !== undefined && selection.quantity !== 1) return { error: 'Số lượng của lựa chọn không hợp lệ' }

    const message = selection.messageText?.trim() ?? ''
    if (message.length > MESSAGE_MAX_LENGTH) return { error: `Lời chúc tối đa ${MESSAGE_MAX_LENGTH} ký tự` }
    if (message && match.option.productType !== 'GREETING_CARD') return { error: 'Chỉ thiệp mới có lời chúc' }
    if (selection.messageRenderingMethod && !MESSAGE_RENDERING_METHODS.includes(selection.messageRenderingMethod)) return { error: 'Cách thể hiện lời chúc không hợp lệ' }

    selections.push({
      bundleOptionId: selection.bundleOptionId,
      quantity: 1,
      ...(message ? { messageText: message, messageRenderingMethod: selection.messageRenderingMethod ?? 'HANDWRITTEN' } : {}),
    })
  }

  for (const group of groups) {
    const chosen = selections.filter((selection) => group.options.some((option) => option.id === selection.bundleOptionId)).length
    const max = group.selectionType === 'SINGLE' ? 1 : (group.maxSelections ?? Infinity)
    const min = group.isRequired ? Math.max(group.minSelections ?? 1, 1) : (group.minSelections ?? 0)
    if (chosen > max) return { error: `"${group.name}": chọn tối đa ${max}` }
    if (chosen < min) return { error: `Vui lòng chọn "${group.name}"` }
  }
  return { selections }
}

export const selectionKey = (variantId: string, selections: readonly SelectionInput[]): string =>
  JSON.stringify([variantId, [...selections].sort((a, b) => a.bundleOptionId.localeCompare(b.bundleOptionId)).map((s) => [s.bundleOptionId, s.messageText ?? '', s.messageRenderingMethod ?? ''])])
