import type { Product, ProductVariant } from './types'

/** Biến thể mua được: đang bán và còn hàng. */
export const isVariantPurchasable = (variant: Pick<ProductVariant, 'status' | 'stockQuantity'>): boolean =>
  variant.status === 'AVAILABLE' && variant.stockQuantity > 0

/** Sản phẩm mua được khi đang bán và có ít nhất một biến thể mua được. */
export const isPurchasable = (product: Pick<Product, 'status' | 'variants'>): boolean =>
  product.status === 'AVAILABLE' && product.variants.some(isVariantPurchasable)

/** Cửa hàng ẩn sản phẩm đã ngừng bán; hết hàng vẫn hiển thị (nhưng không mua được). */
export const isVisibleInStore = (product: Pick<Product, 'status'>): boolean => product.status !== 'DISCONTINUED'

/** Khoảng giá của các biến thể còn bán (nếu không còn biến thể nào thì tính trên tất cả); null khi chưa có biến thể. */
export function getPriceRange(product: Pick<Product, 'variants'>): { min: number; max: number } | null {
  const active = product.variants.filter((variant) => variant.status !== 'DISCONTINUED')
  const pool = active.length > 0 ? active : product.variants
  if (pool.length === 0) return null
  const prices = pool.map((variant) => variant.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export const getTotalStock = (product: Pick<Product, 'variants'>): number =>
  product.variants.reduce((sum, variant) => sum + (variant.status === 'AVAILABLE' ? variant.stockQuantity : 0), 0)

/** Map optionId → valueId đang chọn. */
export type OptionSelection = Record<string, string>

const sortedOptions = (product: Pick<Product, 'options'>) =>
  [...product.options].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

/** "Hồng phấn · M": giá trị tùy chọn của biến thể theo thứ tự hiển thị; null nếu sản phẩm không có tuỳ chọn. */
export function getVariantLabel(product: Pick<Product, 'options'>, variant: Pick<ProductVariant, 'optionValueIds'>): string | null {
  const labels = sortedOptions(product).flatMap((option) => {
    const value = option.values.find((candidate) => variant.optionValueIds.includes(candidate.id))
    return value ? [value.value] : []
  })
  return labels.length > 0 ? labels.join(' · ') : null
}

/** Map tên tùy chọn → giá trị, dùng làm snapshot (`variant_snapshot`). */
export function getVariantAttributes(product: Pick<Product, 'options'>, variant: Pick<ProductVariant, 'optionValueIds'>): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const option of sortedOptions(product)) {
    const value = option.values.find((candidate) => variant.optionValueIds.includes(candidate.id))
    if (value) attributes[option.name] = value.value
  }
  return attributes
}

/** Biến thể khớp đầy đủ lựa chọn; undefined nếu chưa chọn đủ hoặc không có tổ hợp như vậy. */
export function findVariant(product: Pick<Product, 'options' | 'variants'>, selection: OptionSelection): ProductVariant | undefined {
  if (product.options.some((option) => !selection[option.id])) return undefined
  const chosen = product.options.map((option) => selection[option.id] as string)
  return product.variants.find((variant) => chosen.every((valueId) => variant.optionValueIds.includes(valueId)))
}

/** Lựa chọn mặc định: biến thể mua được đầu tiên (nếu không có thì biến thể đầu tiên). */
export function getDefaultSelection(product: Pick<Product, 'options' | 'variants'>): OptionSelection {
  const variant = product.variants.find(isVariantPurchasable) ?? product.variants[0]
  const selection: OptionSelection = {}
  if (!variant) return selection
  for (const option of product.options) {
    const value = option.values.find((candidate) => variant.optionValueIds.includes(candidate.id))
    if (value) selection[option.id] = value.id
  }
  return selection
}

/** Giá trị tùy chọn còn dùng được nếu tồn tại biến thể mua được khớp nó và các lựa chọn khác đang chọn. */
export function isOptionValueAvailable(product: Pick<Product, 'options' | 'variants'>, selection: OptionSelection, optionId: string, valueId: string): boolean {
  const others = product.options.filter((option) => option.id !== optionId && selection[option.id])
  return product.variants.some(
    (variant) =>
      isVariantPurchasable(variant) &&
      variant.optionValueIds.includes(valueId) &&
      others.every((option) => variant.optionValueIds.includes(selection[option.id] as string)),
  )
}

/** Thêm thẳng vào giỏ từ thẻ sản phẩm được khi chỉ có một biến thể và không có nhóm tuỳ chọn bundle. */
export function isSimpleProduct(product: Pick<Product, 'variants'>): boolean {
  const [only] = product.variants
  return product.variants.length === 1 && !!only && (only.bundle?.optionGroups.length ?? 0) === 0
}

/** URL ảnh đại diện: ảnh đánh dấu thumbnail, nếu không có thì ảnh đầu tiên. */
export function getThumbnailUrl(product: Pick<Product, 'images'>): string | undefined {
  const image = product.images.find((candidate) => candidate.isThumbnail) ?? product.images[0]
  return image ? image.secureUrl || image.imageUrl : undefined
}
