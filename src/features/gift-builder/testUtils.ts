import { makeProduct, makeVariant } from '@/features/products/testUtils'
import type { Product, ProductVariant } from '@/features/products/types'
import { getVariantLabel } from '@/features/products/productRules'
import type { VariantEntry } from './catalog'

/** Mục catalog của biến thể đầu tiên của sản phẩm (hoặc biến thể chỉ định). */
export const entryOf = (product: Product, variant: ProductVariant = product.variants[0]!): VariantEntry => ({
  product,
  variant,
  label: getVariantLabel(product, variant),
})

const cm = (length: number, width: number, height: number) => ({ length, width, height, unit: 'CM' as const })

/** Hộp vừa: lòng 22×22×10 cm, tối đa 3 kg. */
export const makeBox = (overrides: Partial<Product> = {}): Product =>
  makeProduct({
    id: 'b1', name: 'Hộp Vừa', productType: 'READY_MADE_GIFT_BOX',
    variants: [makeVariant({ id: 'bv1', productId: 'b1', sku: 'BOX-M', price: 90000, stockQuantity: 10, giftBoxDetail: { inner: cm(22, 22, 10), maxWeight: { value: 3, unit: 'KG' } } })],
    ...overrides,
  })

/** Phụ kiện đóng gói (miễn phí trong hộp tùy chỉnh nhưng vẫn có giá bán lẻ). */
export const makeAccessory = (overrides: Partial<Product> = {}): Product =>
  makeProduct({ id: 'w1', name: 'Giấy kraft', productType: 'PACKAGING_ACCESSORY', price: 25000, stockQuantity: 10, ...overrides })

export const makeCard = (overrides: Partial<Product> = {}): Product =>
  makeProduct({ id: 'k1', name: 'Thiệp viết tay', productType: 'GREETING_CARD', price: 45000, stockQuantity: 10, ...overrides })

/** Món quà lẻ đủ điều kiện vào hộp tùy chỉnh; mặc định 100 g, 10×10×10 cm. */
export const makeGift = (overrides: Partial<Product> = {}): Product =>
  makeProduct({
    id: 'g1', name: 'Trà thảo mộc', isCustomBoxEligible: true,
    variants: [makeVariant({ id: 'gv1', productId: 'g1', sku: 'TEA', price: 85000, stockQuantity: 10, dimensions: cm(10, 10, 10), weight: { value: 100, unit: 'G' } })],
    ...overrides,
  })

export const CATEGORIES = [
  { id: 'cat-box', name: 'Hộp quà', description: null },
  { id: 'cat-gift', name: 'Thực phẩm', description: null },
]
