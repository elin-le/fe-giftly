import { getVariantLabel } from '@/features/products/productRules'
import type { Product, ProductStatus, ProductType, ProductVariant } from '@/features/products/types'

export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'out' | 'low' | 'ok'

export const getStockLevel = (quantity: number): StockLevel => (quantity <= 0 ? 'out' : quantity <= LOW_STOCK_THRESHOLD ? 'low' : 'ok')

export interface ProductFilter {
  search: string
  categoryId: string
  productType: ProductType | ''
  status: ProductStatus | ''
}

export const EMPTY_FILTER: ProductFilter = { search: '', categoryId: '', productType: '', status: '' }

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()

/** Khớp theo tên sản phẩm, SKU hoặc nhãn biến thể (không phân biệt dấu/hoa thường) cùng các bộ lọc còn lại. */
export function filterProducts(products: readonly Product[], filter: ProductFilter): Product[] {
  const keyword = normalize(filter.search.trim())
  return products.filter((product) => {
    if (filter.categoryId && product.categoryId !== filter.categoryId) return false
    if (filter.productType && product.productType !== filter.productType) return false
    if (filter.status && product.status !== filter.status) return false
    if (!keyword) return true
    const haystack = [product.name, ...product.variants.flatMap((v) => [v.sku, getVariantLabel(product, v) ?? ''])].map(normalize)
    return haystack.some((text) => text.includes(keyword))
  })
}

/** Biến thể thấp tồn kho/hết hàng để làm nổi bật trong danh sách. */
export const countLowStockVariants = (variants: readonly Pick<ProductVariant, 'stockQuantity'>[]): number =>
  variants.filter((v) => getStockLevel(v.stockQuantity) !== 'ok').length
