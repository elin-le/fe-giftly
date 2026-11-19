import { isImageUrl } from './imageUpload'
import {
  COMPONENT_ROLES,
  DIMENSION_UNITS,
  OPTION_GROUP_TYPES,
  PRICING_MODES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  RETURN_POLICIES,
  SELECTION_TYPES,
  WEIGHT_UNITS,
  type BundleInput,
  type ComponentRole,
  type OptionGroupType,
  type Product,
  type ProductInput,
  type ProductType,
  type VariantInput,
} from './types'


export const MAX_IMAGES = 10
export const MIN_PERISHABLE_ADVANCE_PERCENT = 50

/** Loại sản phẩm được phép giữ từng vai trò trong set quà (`bundle_component.component_role`). */
export const ROLE_PRODUCT_TYPES: Record<ComponentRole, readonly ProductType[]> = {
  BOX: ['READY_MADE_GIFT_BOX'],
  PRODUCT: ['REGULAR'],
  ACCESSORY: ['PACKAGING_ACCESSORY'],
  GREETING_CARD: ['GREETING_CARD'],
}

/** Loại sản phẩm được phép nằm trong từng nhóm tuỳ chọn (`bundle_option_group.group_type`). */
export const GROUP_PRODUCT_TYPES: Record<OptionGroupType, readonly ProductType[]> = {
  GREETING_CARD: ['GREETING_CARD'],
  PACKAGING_ACCESSORY: ['PACKAGING_ACCESSORY'],
  OTHER: ['REGULAR', 'READY_MADE_GIFT_BOX', 'PACKAGING_ACCESSORY', 'GREETING_CARD'],
}

export interface ProductInputContext {
  categoryIds: readonly string[]
  /** Mọi sản phẩm khác sản phẩm đang sửa — dùng kiểm tra SKU, id tuỳ chọn và tham chiếu của bundle. */
  otherProducts: readonly Product[]
}

const isPositive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
const isIntAtLeast = (value: unknown, min: number): value is number => Number.isInteger(value) && (value as number) >= min

function validateDimensions(variant: VariantInput): string | null {
  const { dimensions, weight } = variant
  if (dimensions && (!isPositive(dimensions.length) || !isPositive(dimensions.width) || !isPositive(dimensions.height) || !DIMENSION_UNITS.includes(dimensions.unit))) {
    return 'Kích thước cần đủ dài, rộng, cao dương và đơn vị'
  }
  if (weight && (!isPositive(weight.value) || !WEIGHT_UNITS.includes(weight.unit))) return 'Khối lượng cần là số dương và có đơn vị'
  return null
}

function validatePolicy(variant: VariantInput): string | null {
  const { policy } = variant
  if (!policy) return null
  const advance = policy.advancePaymentPercent
  if (advance !== null && (typeof advance !== 'number' || advance < 0 || advance > 100)) return 'Tỷ lệ đặt cọc phải từ 0 đến 100'
  if (policy.shelfLifeHours !== null && !isIntAtLeast(policy.shelfLifeHours, 1)) return 'Hạn sử dụng (giờ) phải là số nguyên dương'
  if (policy.returnPolicy !== null && !RETURN_POLICIES.includes(policy.returnPolicy)) return 'Chính sách đổi trả không hợp lệ'
  if (policy.isPerishable && (policy.returnPolicy !== 'NO_RETURN' || (advance ?? 0) < MIN_PERISHABLE_ADVANCE_PERCENT)) {
    return `Hàng dễ hỏng phải không đổi trả và đặt cọc tối thiểu ${MIN_PERISHABLE_ADVANCE_PERCENT}%`
  }
  return null
}

function validateGiftBoxDetail(variant: VariantInput, productType: ProductType): string | null {
  const detail = variant.giftBoxDetail
  if (!detail) return null
  if (productType !== 'READY_MADE_GIFT_BOX') return 'Chỉ hộp quà mới có kích thước lòng hộp và tải trọng'
  const { inner, maxWeight } = detail
  if (inner && (!isPositive(inner.length) || !isPositive(inner.width) || !isPositive(inner.height) || !DIMENSION_UNITS.includes(inner.unit))) {
    return 'Lòng hộp cần đủ dài, rộng, cao dương và đơn vị'
  }
  if (maxWeight && (!isPositive(maxWeight.value) || !WEIGHT_UNITS.includes(maxWeight.unit))) return 'Tải trọng tối đa phải là số dương và có đơn vị'
  return null
}

function validateBundle(bundle: BundleInput, lookup: Map<string, Product>): string | null {
  const resolveType = (variantId: string) => lookup.get(variantId)?.productType

  const seenComponents = new Set<string>()
  for (const component of bundle.components) {
    const type = resolveType(component.componentVariantId)
    if (!type) return 'Thành phần của set không tồn tại'
    if (!COMPONENT_ROLES.includes(component.componentRole)) return 'Vai trò thành phần không hợp lệ'
    if (!ROLE_PRODUCT_TYPES[component.componentRole].includes(type)) return 'Loại sản phẩm không khớp vai trò thành phần'
    if (!isIntAtLeast(component.quantity, 1)) return 'Số lượng thành phần không hợp lệ'
    if (seenComponents.has(component.componentVariantId)) return 'Thành phần bị trùng trong set'
    seenComponents.add(component.componentVariantId)
  }
  if (bundle.components.filter((component) => component.componentRole === 'BOX').length > 1) return 'Set quà chỉ có một hộp chứa'

  for (const group of bundle.optionGroups) {
    if (group.name.trim() === '') return 'Tên nhóm tuỳ chọn không được để trống'
    if (!OPTION_GROUP_TYPES.includes(group.groupType) || !SELECTION_TYPES.includes(group.selectionType)) return 'Loại nhóm tuỳ chọn không hợp lệ'
    const { minSelections: min, maxSelections: max } = group
    if ((min !== null && !isIntAtLeast(min, 0)) || (max !== null && !isIntAtLeast(max, 1))) return `"${group.name}": số lượng chọn không hợp lệ`
    if (min !== null && max !== null && min > max) return `"${group.name}": tối thiểu không được lớn hơn tối đa`
    if (group.selectionType === 'SINGLE' && ((max ?? 1) > 1 || (min ?? 0) > 1)) return `"${group.name}": nhóm chọn một chỉ được chọn tối đa 1`
    if (group.isRequired && (min ?? 0) < 1) return `"${group.name}": nhóm bắt buộc cần chọn tối thiểu 1`
    if (group.options.length === 0) return `"${group.name}": nhóm cần ít nhất một lựa chọn`

    const seen = new Set<string>()
    for (const option of group.options) {
      const type = resolveType(option.productVariantId)
      if (!type) return `"${group.name}": lựa chọn không tồn tại`
      if (!GROUP_PRODUCT_TYPES[group.groupType].includes(type)) return `"${group.name}": loại sản phẩm không khớp loại nhóm`
      if (seen.has(option.productVariantId)) return `"${group.name}": lựa chọn bị trùng`
      seen.add(option.productVariantId)
      if (!PRICING_MODES.includes(option.pricingMode)) return `"${group.name}": cách tính giá không hợp lệ`
      if (option.pricingMode === 'FIXED_PRICE' ? !(typeof option.fixedPrice === 'number' && option.fixedPrice >= 0) : option.fixedPrice !== null) {
        return `"${group.name}": giá cố định chỉ nhập khi chọn "Giá cố định"`
      }
    }
  }
  return null
}

function validateOptions(input: ProductInput, takenIds: Set<string>): string | null {
  const names = new Set<string>()
  const ids = new Set<string>()
  for (const option of input.options) {
    const name = option.name.trim().toLowerCase()
    if (name === '') return 'Tên tuỳ chọn không được để trống'
    if (names.has(name)) return `Tuỳ chọn "${option.name}" bị trùng`
    names.add(name)
    if (option.values.length === 0) return `Tuỳ chọn "${option.name}" cần ít nhất một giá trị`
    const labels = new Set<string>()
    for (const value of option.values) {
      const label = value.value.trim().toLowerCase()
      if (label === '') return `Giá trị của "${option.name}" không được để trống`
      if (labels.has(label)) return `Giá trị "${value.value}" bị trùng trong "${option.name}"`
      labels.add(label)
      if (value.colorHex !== null && !/^#[0-9a-fA-F]{6}$/.test(value.colorHex)) return 'Mã màu phải có dạng #RRGGBB'
      if (ids.has(value.id) || takenIds.has(value.id)) return 'Mã giá trị tuỳ chọn bị trùng'
      ids.add(value.id)
    }
  }
  return null
}

function validateVariantOptions(input: ProductInput, variant: VariantInput): string | null {
  const chosen = Array.isArray(variant.optionValueIds) ? variant.optionValueIds : []
  if (input.options.length === 0) return chosen.length === 0 ? null : 'Sản phẩm không có tuỳ chọn'
  for (const option of input.options) {
    if (option.values.filter((value) => chosen.includes(value.id)).length !== 1) return `Biến thể cần chọn đúng một giá trị cho "${option.name}"`
  }
  const known = new Set(input.options.flatMap((option) => option.values.map((value) => value.id)))
  return chosen.every((id) => known.has(id)) ? null : 'Giá trị tuỳ chọn không thuộc sản phẩm này'
}

/** Kiểm tra dữ liệu sản phẩm do admin gửi theo ràng buộc DB và quy tắc nghiệp vụ; trả về thông báo lỗi đầu tiên hoặc `null`. */
export function validateProductInput(input: ProductInput, { categoryIds, otherProducts }: ProductInputContext): string | null {
  if (typeof input.name !== 'string' || input.name.trim() === '') return 'Tên sản phẩm không được để trống'
  if (!categoryIds.includes(input.categoryId)) return 'Danh mục không tồn tại'
  if (!PRODUCT_TYPES.includes(input.productType) || !PRODUCT_STATUSES.includes(input.status)) return 'Loại hoặc trạng thái không hợp lệ'

  const images = Array.isArray(input.images) ? input.images : []
  if (images.length > MAX_IMAGES) return `Tối đa ${MAX_IMAGES} ảnh`
  if (images.some((image) => !isImageUrl(image.imageUrl))) return 'Đường dẫn ảnh phải bắt đầu bằng http://, https:// hoặc là ảnh tải lên'
  if (images.filter((image) => image.isThumbnail).length > 1) return 'Chỉ được chọn một ảnh đại diện'
  const variantIds = new Set((Array.isArray(input.variants) ? input.variants : []).flatMap((variant) => (variant.id ? [variant.id] : [])))
  if (images.some((image) => image.productVariantId !== null && !variantIds.has(image.productVariantId))) return 'Ảnh riêng của biến thể phải thuộc một biến thể đã có của sản phẩm'

  const options = Array.isArray(input.options) ? input.options : []
  if (!Array.isArray(input.variants) || input.variants.length === 0) return 'Sản phẩm cần ít nhất một biến thể'
  const normalized = { ...input, options }

  const takenValueIds = new Set(otherProducts.flatMap((p) => p.options.flatMap((o) => o.values.map((v) => v.id))))
  const optionProblem = validateOptions(normalized, takenValueIds)
  if (optionProblem) return optionProblem

  const takenSkus = new Set(otherProducts.flatMap((p) => p.variants.map((v) => v.sku.toLowerCase())))
  const lookup = new Map(otherProducts.flatMap((p) => p.variants.map((v) => [v.id, p] as const)))
  const seenSkus = new Set<string>()
  const seenCombos = new Set<string>()

  for (const variant of input.variants) {
    const sku = typeof variant.sku === 'string' ? variant.sku.trim() : ''
    if (sku === '') return 'SKU không được để trống'
    if (takenSkus.has(sku.toLowerCase()) || seenSkus.has(sku.toLowerCase())) return `SKU "${sku}" đã tồn tại`
    seenSkus.add(sku.toLowerCase())
    if (!Number.isInteger(variant.price) || variant.price < 1) return 'Giá phải là số nguyên dương'
    if (!Number.isInteger(variant.stockQuantity) || variant.stockQuantity < 0) return 'Tồn kho không hợp lệ'
    if (!PRODUCT_STATUSES.includes(variant.status)) return 'Trạng thái biến thể không hợp lệ'

    const problem =
      validateVariantOptions(normalized, variant) ??
      validateDimensions(variant) ??
      validatePolicy(variant) ??
      validateGiftBoxDetail(variant, input.productType) ??
      (variant.bundle && input.productType !== 'READY_MADE_GIFT_SET' ? 'Chỉ set quà mới có thành phần và nhóm tuỳ chọn' : null) ??
      (variant.bundle ? validateBundle(variant.bundle, lookup) : null)
    if (problem) return problem

    const combo = [...variant.optionValueIds].sort().join('|')
    if (seenCombos.has(combo)) return 'Hai biến thể không được có cùng tổ hợp tuỳ chọn'
    seenCombos.add(combo)
  }
  return null
}
