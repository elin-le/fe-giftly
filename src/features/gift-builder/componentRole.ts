import type { ComponentRole, ProductType } from '@/features/products/types'

/** Vai trò của một món khi nằm TRONG hộp tùy chỉnh (hộp chứa luôn là BOX và được chọn riêng). */
export function getItemRole(productType: ProductType): ComponentRole {
  if (productType === 'PACKAGING_ACCESSORY') return 'ACCESSORY'
  if (productType === 'GREETING_CARD') return 'GREETING_CARD'
  return 'PRODUCT'
}

/** Phụ kiện đóng gói trong hộp tùy chỉnh được miễn phí (nhưng vẫn trừ tồn kho). */
export const isComplimentaryInBox = (productType: ProductType): boolean => productType === 'PACKAGING_ACCESSORY'
