import { getVariantLabel } from '@/features/products/productRules'
import type { Product, ProductVariant } from '@/features/products/types'
import type { MockDb } from './db'

export interface VariantRef {
  product: Product
  variant: ProductVariant
}

export function findVariantRef(db: MockDb, variantId: unknown): VariantRef | undefined {
  for (const product of db.products) {
    const variant = product.variants.find((candidate) => candidate.id === variantId)
    if (variant) return { product, variant }
  }
  return undefined
}

/** "Tên sản phẩm (Hồng phấn · M)" dùng trong thông báo lỗi. */
export function describeVariant({ product, variant }: VariantRef): string {
  const label = getVariantLabel(product, variant)
  return label ? `${product.name} (${label})` : product.name
}

/**
 * Bản sản phẩm trả cho client: điền tên/giá/tồn kho cho thành phần và tuỳ chọn của set (suy ra từ biến thể gốc,
 * nên luôn khớp tồn kho hiện tại) và điểm đánh giá trung bình gộp mọi biến thể.
 */
export function resolveProducts(db: MockDb): Product[] {
  const label = (ref: VariantRef) => getVariantLabel(ref.product, ref.variant)

  return db.products.map((product) => {
    const reviews = db.reviews.filter((review) => review.productId === product.id)
    const ratingAverage = reviews.length === 0 ? null : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10

    const variants = product.variants.map((variant) => {
      if (!variant.bundle) return variant
      const components = variant.bundle.components.flatMap((component) => {
        const ref = findVariantRef(db, component.variantId)
        return ref ? [{ ...component, productId: ref.product.id, productName: ref.product.name, optionLabel: label(ref), policy: ref.variant.policy }] : []
      })
      const optionGroups = variant.bundle.optionGroups.map((group) => ({
        ...group,
        options: group.options.flatMap((option) => {
          const ref = findVariantRef(db, option.variantId)
          if (!ref) return []
          const price = option.pricingMode === 'FREE' ? 0 : option.pricingMode === 'FIXED_PRICE' ? (option.fixedPrice ?? 0) : ref.variant.price
          return [{
            ...option, productId: ref.product.id, productName: ref.product.name, optionLabel: label(ref),
            productType: ref.product.productType, price, stockQuantity: ref.variant.stockQuantity, policy: ref.variant.policy,
          }]
        }),
      }))
      return { ...variant, bundle: { components, optionGroups } }
    })
    return { ...product, variants, ratingAverage, reviewCount: reviews.length }
  })
}
