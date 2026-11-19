import type { Product, ProductVariant } from './types'

/** Biến thể dựng sẵn cho test; ghi đè từng trường khi cần. */
export const makeVariant = (overrides: Partial<ProductVariant> = {}): ProductVariant => ({
  id: 'v1',
  productId: 'p1',
  sku: 'SKU-1',
  price: 100000,
  stockQuantity: 5,
  status: 'AVAILABLE',
  dimensions: null,
  weight: null,
  optionValueIds: [],
  policy: null,
  giftBoxDetail: null,
  bundle: null,
  ...overrides,
})

type ProductOverrides = Partial<Product> & { price?: number; stockQuantity?: number }

/**
 * Sản phẩm dựng sẵn cho test, mặc định một biến thể. `price` / `stockQuantity` là cách viết tắt
 * để chỉnh biến thể duy nhất; truyền `variants` khi cần nhiều biến thể.
 */
export const makeProduct = ({ price, stockQuantity, variants, ...overrides }: ProductOverrides = {}): Product => {
  const id = overrides.id ?? 'p1'
  return {
    id,
    categoryId: 'c-birthday',
    name: 'Hộp quà Sinh nhật',
    description: 'Mô tả',
    productType: 'REGULAR',
    status: 'AVAILABLE',
    isCustomBoxEligible: false,
    images: [],
    options: [],
    ratingAverage: null,
    reviewCount: 0,
    variants: variants ?? [makeVariant({ id: `${id}-v`, productId: id, sku: `SKU-${id}`, ...(price !== undefined && { price }), ...(stockQuantity !== undefined && { stockQuantity }) })],
    ...overrides,
  }
}
