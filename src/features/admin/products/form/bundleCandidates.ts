import { getVariantLabel } from '@/features/products/productRules'
import type { Product, ProductType } from '@/features/products/types'

/** Biến thể có thể chọn làm thành phần / lựa chọn của set quà. */
export interface VariantCandidate {
  variantId: string
  productType: ProductType
  /** "Nến thơm Hoa Nhài (200g) · CANDLE-200" */
  label: string
}

/** Mọi biến thể còn bán của sản phẩm khác, trừ set quà (không lồng set). */
export function buildVariantCandidates(products: readonly Product[], excludeProductId?: string): VariantCandidate[] {
  return products
    .filter((product) => product.id !== excludeProductId && product.productType !== 'READY_MADE_GIFT_SET')
    .flatMap((product) =>
      product.variants
        .filter((variant) => variant.status !== 'DISCONTINUED')
        .map((variant) => {
          const option = getVariantLabel(product, variant)
          return { variantId: variant.id, productType: product.productType, label: `${product.name}${option ? ` (${option})` : ''} · ${variant.sku}` }
        }),
    )
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
}

export const filterCandidates = (candidates: readonly VariantCandidate[], types: readonly ProductType[]): VariantCandidate[] =>
  candidates.filter((candidate) => types.includes(candidate.productType))
