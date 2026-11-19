import { getVariantLabel, isVariantPurchasable } from '@/features/products/productRules'
import type { Product, ProductVariant } from '@/features/products/types'

/** Một biến thể còn bán, kèm sản phẩm cha để hiển thị. */
export interface VariantEntry {
  product: Product
  variant: ProductVariant
  /** "Hồng phấn · M" hoặc null. */
  label: string | null
}

export interface BuilderCatalog {
  boxes: VariantEntry[]
  items: VariantEntry[]
  accessories: VariantEntry[]
  cards: VariantEntry[]
}

export const entryName = ({ product, label }: Pick<VariantEntry, 'product' | 'label'>): string =>
  label ? `${product.name} (${label})` : product.name

/**
 * Tách biến thể còn bán và còn hàng thành hộp, món quà, phụ kiện và thiệp (theo `product_type`).
 * Món quà chỉ gồm REGULAR có `is_custom_box_eligible`; set quà không bao giờ được đưa vào hộp tùy chỉnh.
 */
export function splitCatalog(products: readonly Product[]): BuilderCatalog {
  const catalog: BuilderCatalog = { boxes: [], items: [], accessories: [], cards: [] }

  for (const product of products) {
    if (product.status !== 'AVAILABLE') continue
    for (const variant of product.variants) {
      if (!isVariantPurchasable(variant)) continue
      const entry: VariantEntry = { product, variant, label: getVariantLabel(product, variant) }
      if (product.productType === 'READY_MADE_GIFT_BOX') catalog.boxes.push(entry)
      else if (product.productType === 'REGULAR' && product.isCustomBoxEligible) catalog.items.push(entry)
      else if (product.productType === 'PACKAGING_ACCESSORY') catalog.accessories.push(entry)
      else if (product.productType === 'GREETING_CARD') catalog.cards.push(entry)
    }
  }
  catalog.boxes.sort((a, b) => a.variant.price - b.variant.price)
  return catalog
}
