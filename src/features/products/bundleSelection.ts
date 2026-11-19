import type { SelectionInput } from '@/features/cart/types'
import { MESSAGE_MAX_LENGTH } from '@/features/gift-builder/constants'
import type { Bundle, BundleOption, MessageRenderingMethod } from './types'

/** Lựa chọn của khách cho một set: groupId → các optionId đã chọn; lời chúc theo optionId. */
export interface BundleChoice {
  picked: Record<string, string[]>
  messages: Record<string, { text: string; method: MessageRenderingMethod }>
}

export const EMPTY_CHOICE: BundleChoice = { picked: {}, messages: {} }

/** Bật/tắt một tuỳ chọn: nhóm SINGLE thay thế lựa chọn cũ; nhóm MULTIPLE giới hạn theo `maxSelections`. */
export function toggleOption(choice: BundleChoice, bundle: Bundle, groupId: string, optionId: string): BundleChoice {
  const group = bundle.optionGroups.find((candidate) => candidate.id === groupId)
  if (!group) return choice
  const current = choice.picked[groupId] ?? []

  let next: string[]
  if (current.includes(optionId)) next = group.isRequired && group.selectionType === 'SINGLE' ? current : current.filter((id) => id !== optionId)
  else if (group.selectionType === 'SINGLE') next = [optionId]
  else next = group.maxSelections !== null && current.length >= group.maxSelections ? current : [...current, optionId]

  return { ...choice, picked: { ...choice.picked, [groupId]: next } }
}

export const setOptionMessage = (choice: BundleChoice, optionId: string, patch: Partial<{ text: string; method: MessageRenderingMethod }>): BundleChoice => {
  const current = choice.messages[optionId] ?? { text: '', method: 'HANDWRITTEN' as const }
  const next = { ...current, ...patch, text: (patch.text ?? current.text).slice(0, MESSAGE_MAX_LENGTH) }
  return { ...choice, messages: { ...choice.messages, [optionId]: next } }
}

const allOptions = (bundle: Bundle): BundleOption[] => bundle.optionGroups.flatMap((group) => group.options)

export function getPickedOptions(choice: BundleChoice, bundle: Bundle): BundleOption[] {
  const ids = new Set(Object.values(choice.picked).flat())
  return allOptions(bundle).filter((option) => ids.has(option.id))
}

/** Phụ thu của các lựa chọn đã chọn (cộng vào giá set). */
export const calcSurcharge = (choice: BundleChoice, bundle: Bundle): number =>
  getPickedOptions(choice, bundle).reduce((sum, option) => sum + option.price, 0)

/** Lỗi ngăn thêm vào giỏ: nhóm bắt buộc chưa chọn đủ, lựa chọn hết hàng. */
export function getChoiceIssues(choice: BundleChoice, bundle: Bundle): string[] {
  const issues: string[] = []
  for (const group of bundle.optionGroups) {
    const picked = choice.picked[group.id] ?? []
    const min = group.isRequired ? Math.max(group.minSelections ?? 1, 1) : (group.minSelections ?? 0)
    if (picked.length < min) issues.push(`Vui lòng chọn "${group.name}".`)
    for (const optionId of picked) {
      const option = group.options.find((candidate) => candidate.id === optionId)
      if (option && option.stockQuantity === 0) issues.push(`"${option.productName}" đã hết hàng.`)
    }
  }
  return issues
}

export function toSelectionInputs(choice: BundleChoice, bundle: Bundle): SelectionInput[] {
  return getPickedOptions(choice, bundle).map((option) => {
    const message = option.productType === 'GREETING_CARD' ? (choice.messages[option.id]?.text.trim() ?? '') : ''
    return {
      bundleOptionId: option.id,
      ...(message && { messageText: message, messageRenderingMethod: choice.messages[option.id]?.method ?? 'HANDWRITTEN' }),
    }
  })
}
