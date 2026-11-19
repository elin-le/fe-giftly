import type { Category } from '@/features/products/types'
import type { CategoryInput } from './types'

export const CATEGORY_NAME_MIN = 2
export const CATEGORY_NAME_MAX = 60
export const CATEGORY_DESCRIPTION_MAX = 200

/** Lỗi (tiếng Việt) của danh mục, hoặc `null` nếu hợp lệ; tên không được trùng danh mục khác. */
export function validateCategory(input: CategoryInput, others: readonly Pick<Category, 'name'>[]): string | null {
  const name = input.name.trim()
  if (name.length < CATEGORY_NAME_MIN) return `Tên danh mục tối thiểu ${CATEGORY_NAME_MIN} ký tự`
  if (name.length > CATEGORY_NAME_MAX) return `Tên danh mục tối đa ${CATEGORY_NAME_MAX} ký tự`
  if ((input.description?.trim().length ?? 0) > CATEGORY_DESCRIPTION_MAX) return `Mô tả tối đa ${CATEGORY_DESCRIPTION_MAX} ký tự`
  if (others.some((other) => other.name.trim().toLowerCase() === name.toLowerCase())) return 'Tên danh mục đã tồn tại'
  return null
}
