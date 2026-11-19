import type { ReturnPolicy, VariantPolicy } from './types'

export interface MergedPolicy {
  returnPolicy: ReturnPolicy
  /** 0–100. */
  advancePaymentPercent: number
  isPerishable: boolean
  /** Hạn dùng ngắn nhất trong các thành phần dễ hỏng; null nếu không có. */
  shelfLifeHours: number | null
}

/**
 * Chính sách của một dòng gồm nhiều thành phần (set quà, hộp tùy chỉnh):
 * - Không đổi trả nếu BẤT KỲ thành phần nào không đổi trả.
 * - Tỷ lệ đặt cọc là tỷ lệ CAO NHẤT trong các thành phần.
 */
export function mergePolicies(policies: readonly (VariantPolicy | null | undefined)[]): MergedPolicy {
  let returnPolicy: ReturnPolicy = 'RETURNABLE'
  let advancePaymentPercent = 0
  let isPerishable = false
  let shelfLifeHours: number | null = null

  for (const policy of policies) {
    if (!policy) continue
    if (policy.returnPolicy === 'NO_RETURN') returnPolicy = 'NO_RETURN'
    advancePaymentPercent = Math.max(advancePaymentPercent, policy.advancePaymentPercent ?? 0)
    isPerishable ||= policy.isPerishable
    if (policy.isPerishable && policy.shelfLifeHours !== null) {
      shelfLifeHours = shelfLifeHours === null ? policy.shelfLifeHours : Math.min(shelfLifeHours, policy.shelfLifeHours)
    }
  }
  return { returnPolicy, advancePaymentPercent, isPerishable, shelfLifeHours }
}

/** Tiền đặt cọc của một dòng: làm tròn đến đồng. */
export const calcAdvanceAmount = (subtotal: number, advancePaymentPercent: number): number =>
  Math.round((subtotal * advancePaymentPercent) / 100)
