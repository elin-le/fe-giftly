import { isImageUrl } from '@/features/products/imageUpload'
import { z } from 'zod'
import { getVariantLabel } from '@/features/products/productRules'
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
  type Dimensions,
  type Product,
  type ProductInput,
  type ProductType,
  type VariantInput,
  type Weight,
} from '@/features/products/types'

const isBlank = (value: string) => value.trim() === ''
const isPositiveText = (value: string) => isBlank(value) || (Number.isFinite(Number(value)) && Number(value) > 0)
const isIntText = (value: string, min: number) => isBlank(value) || (Number.isInteger(Number(value)) && Number(value) >= min)

/** Ô số tuỳ chọn: để trống hoặc số dương. */
const positiveText = (label: string) => z.string().refine(isPositiveText, `${label} phải là số dương`)

const choiceSchema = z.object({ componentVariantId: z.string().min(1, 'Chọn thành phần') })

const componentSchema = choiceSchema.extend({
  componentRole: z.enum(COMPONENT_ROLES),
  quantity: z.coerce.number<string | number>({ error: 'Số lượng phải là số' }).int('Số lượng phải là số nguyên').min(1, 'Tối thiểu 1'),
  isRequired: z.boolean(),
})

const bundleOptionSchema = z.object({
  productVariantId: z.string().min(1, 'Chọn sản phẩm'),
  pricingMode: z.enum(PRICING_MODES),
  fixedPrice: z.string(),
})

const optionGroupSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên nhóm').max(255, 'Tên quá dài'),
  groupType: z.enum(OPTION_GROUP_TYPES),
  selectionType: z.enum(SELECTION_TYPES),
  minSelections: z.string().refine((v) => isIntText(v, 0), 'Số nguyên ≥ 0'),
  maxSelections: z.string().refine((v) => isIntText(v, 1), 'Số nguyên ≥ 1'),
  isRequired: z.boolean(),
  options: z.array(bundleOptionSchema).min(1, 'Nhóm cần ít nhất một lựa chọn'),
})

const variantSchema = z.object({
  id: z.string().optional(),
  /** Chỉ để hiển thị ("Hồng phấn · M"); không gửi lên server. */
  label: z.string().optional(),
  sku: z.string().trim().min(1, 'SKU không được để trống').max(255, 'SKU quá dài'),
  price: z.coerce.number<string | number>({ error: 'Giá phải là số' }).int('Giá phải là số nguyên').min(1000, 'Giá tối thiểu 1.000₫'),
  stockQuantity: z.coerce.number<string | number>({ error: 'Tồn kho phải là số' }).int('Tồn kho phải là số nguyên').min(0, 'Tồn kho không được âm'),
  status: z.enum(PRODUCT_STATUSES),
  /** optionId → valueId */
  optionChoices: z.record(z.string(), z.string()),
  length: positiveText('Chiều dài'),
  width: positiveText('Chiều rộng'),
  height: positiveText('Chiều cao'),
  dimensionUnit: z.enum(DIMENSION_UNITS),
  weightValue: positiveText('Khối lượng'),
  weightUnit: z.enum(WEIGHT_UNITS),
  hasPolicy: z.boolean(),
  isPerishable: z.boolean(),
  shelfLifeHours: z.string().refine((v) => isIntText(v, 1), 'Số giờ nguyên dương'),
  returnPolicy: z.enum([...RETURN_POLICIES, '']),
  advancePaymentPercent: z.string().refine((v) => isBlank(v) || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100), 'Từ 0 đến 100'),
  innerLength: positiveText('Chiều dài'),
  innerWidth: positiveText('Chiều rộng'),
  innerHeight: positiveText('Chiều cao'),
  innerUnit: z.enum(DIMENSION_UNITS),
  maxWeightValue: positiveText('Tải trọng'),
  maxWeightUnit: z.enum(WEIGHT_UNITS),
  components: z.array(componentSchema),
  optionGroups: z.array(optionGroupSchema),
})

const imageSchema = z.object({
  imageUrl: z.string().trim().refine(isImageUrl, 'Đường dẫn phải bắt đầu bằng http://, https:// hoặc là ảnh tải lên'),
  isThumbnail: z.boolean(),
  /** '' = ảnh chung của sản phẩm. */
  productVariantId: z.string(),
})

const optionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Nhập tên tuỳ chọn').max(255, 'Tên quá dài'),
  values: z.array(
    z.object({
      id: z.string().min(1),
      value: z.string().trim().min(1, 'Nhập giá trị').max(255, 'Giá trị quá dài'),
      colorHex: z.string().refine((v) => v === '' || /^#[0-9a-fA-F]{6}$/.test(v), 'Dạng #RRGGBB'),
    }),
  ).min(1, 'Cần ít nhất một giá trị'),
})

/** Tất cả hoặc không ô nào: dùng cho kích thước (dài, rộng, cao). */
const allOrNone = (values: string[]) => values.every(isBlank) || values.every((v) => !isBlank(v))

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên sản phẩm tối thiểu 2 ký tự').max(255, 'Tên quá dài'),
    description: z.string().trim().max(2000, 'Mô tả tối đa 2000 ký tự'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    productType: z.enum(PRODUCT_TYPES),
    status: z.enum(PRODUCT_STATUSES),
    isCustomBoxEligible: z.boolean(),
    images: z.array(imageSchema).max(10, 'Tối đa 10 ảnh'),
    options: z.array(optionSchema),
    variants: z.array(variantSchema).min(1, 'Sản phẩm cần ít nhất một biến thể'),
  })
  .superRefine((value, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message })

    if (value.images.filter((image) => image.isThumbnail).length > 1) issue(['images'], 'Chỉ được chọn một ảnh đại diện')

    const optionNames = new Set<string>()
    value.options.forEach((option, index) => {
      const key = option.name.toLowerCase()
      if (optionNames.has(key)) issue(['options', index, 'name'], 'Tên tuỳ chọn bị trùng')
      optionNames.add(key)
      const labels = new Set<string>()
      option.values.forEach((entry, valueIndex) => {
        const label = entry.value.toLowerCase()
        if (labels.has(label)) issue(['options', index, 'values', valueIndex, 'value'], 'Giá trị bị trùng')
        labels.add(label)
      })
    })

    const skus = new Set<string>()
    const combos = new Set<string>()
    value.variants.forEach((variant, index) => {
      const at = (field: string, message: string) => issue(['variants', index, field], message)

      const sku = variant.sku.toLowerCase()
      if (skus.has(sku)) at('sku', 'SKU bị trùng')
      skus.add(sku)

      for (const option of value.options) {
        const chosen = variant.optionChoices[option.id]
        if (!chosen || !option.values.some((entry) => entry.id === chosen)) at(`optionChoices.${option.id}`, `Chọn ${option.name}`)
      }
      const combo = value.options.map((option) => variant.optionChoices[option.id] ?? '').join('|')
      if (value.options.length > 0 && combos.has(combo)) at('sku', 'Tổ hợp tuỳ chọn bị trùng với biến thể khác')
      combos.add(combo)

      if (!allOrNone([variant.length, variant.width, variant.height])) at('length', 'Nhập đủ dài, rộng, cao hoặc để trống cả ba')

      if (variant.hasPolicy) {
        const advance = isBlank(variant.advancePaymentPercent) ? 0 : Number(variant.advancePaymentPercent)
        if (variant.isPerishable && variant.returnPolicy !== 'NO_RETURN') at('returnPolicy', 'Hàng dễ hỏng phải không đổi trả')
        if (variant.isPerishable && advance < 50) at('advancePaymentPercent', 'Hàng dễ hỏng cần đặt cọc tối thiểu 50%')
      }

      if (value.productType === 'READY_MADE_GIFT_BOX' && !allOrNone([variant.innerLength, variant.innerWidth, variant.innerHeight])) {
        at('innerLength', 'Nhập đủ dài, rộng, cao lòng hộp hoặc để trống cả ba')
      }

      if (value.productType === 'READY_MADE_GIFT_SET') {
        const seen = new Set<string>()
        variant.components.forEach((component, componentIndex) => {
          if (seen.has(component.componentVariantId)) issue(['variants', index, 'components', componentIndex, 'componentVariantId'], 'Thành phần bị trùng')
          seen.add(component.componentVariantId)
        })
        variant.optionGroups.forEach((group, groupIndex) => {
          const min = isBlank(group.minSelections) ? null : Number(group.minSelections)
          const max = isBlank(group.maxSelections) ? null : Number(group.maxSelections)
          const groupAt = (field: string, message: string) => issue(['variants', index, 'optionGroups', groupIndex, field], message)
          if (min !== null && max !== null && min > max) groupAt('minSelections', 'Tối thiểu không được lớn hơn tối đa')
          if (group.selectionType === 'SINGLE' && ((max ?? 1) > 1 || (min ?? 0) > 1)) groupAt('maxSelections', 'Nhóm chọn một chỉ được tối đa 1')
          if (group.isRequired && (min ?? 0) < 1) groupAt('minSelections', 'Nhóm bắt buộc cần tối thiểu 1')
          group.options.forEach((option, optionIndex) => {
            const needsPrice = option.pricingMode === 'FIXED_PRICE'
            if (needsPrice && (isBlank(option.fixedPrice) || !(Number(option.fixedPrice) >= 0))) {
              issue(['variants', index, 'optionGroups', groupIndex, 'options', optionIndex, 'fixedPrice'], 'Nhập giá cố định')
            }
          })
        })
      }
    })
  })

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormValues = z.output<typeof productFormSchema>
export type VariantFormInput = ProductFormInput['variants'][number]

export const newId = (): string => crypto.randomUUID()

export const emptyVariantForm = (overrides: Partial<VariantFormInput> = {}): VariantFormInput => ({
  sku: '', price: '', stockQuantity: 0, status: 'AVAILABLE', optionChoices: {},
  length: '', width: '', height: '', dimensionUnit: 'CM', weightValue: '', weightUnit: 'G',
  hasPolicy: false, isPerishable: false, shelfLifeHours: '', returnPolicy: '', advancePaymentPercent: '',
  innerLength: '', innerWidth: '', innerHeight: '', innerUnit: 'CM', maxWeightValue: '', maxWeightUnit: 'KG',
  components: [], optionGroups: [], ...overrides,
})

export const EMPTY_PRODUCT_FORM: ProductFormInput = {
  name: '', description: '', categoryId: '', productType: 'REGULAR', status: 'AVAILABLE', isCustomBoxEligible: false,
  images: [], options: [], variants: [emptyVariantForm()],
}

const text = (value: number | null | undefined): string => (value === null || value === undefined ? '' : String(value))

export function toFormValues(product?: Product): ProductFormInput {
  if (!product) return { ...EMPTY_PRODUCT_FORM, variants: [emptyVariantForm()] }
  const { name, description, categoryId, productType, status, isCustomBoxEligible, variants } = product
  return {
    name, description: description ?? '', categoryId, productType, status, isCustomBoxEligible,
    images: product.images.map((image) => ({ imageUrl: image.imageUrl, isThumbnail: image.isThumbnail, productVariantId: image.productVariantId ?? '' })),
    options: [...product.options].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)).map((option) => ({
      id: option.id, name: option.name, values: option.values.map((entry) => ({ id: entry.id, value: entry.value, colorHex: entry.colorHex ?? '' })),
    })),
    variants: variants.map((variant) => {
      const inner = variant.giftBoxDetail?.inner
      const maxWeight = variant.giftBoxDetail?.maxWeight
      const policy = variant.policy
      return emptyVariantForm({
        id: variant.id, label: getVariantLabel(product, variant) ?? undefined, sku: variant.sku, price: variant.price,
        stockQuantity: variant.stockQuantity, status: variant.status,
        optionChoices: Object.fromEntries(product.options.flatMap((option) => {
          const chosen = option.values.find((entry) => variant.optionValueIds.includes(entry.id))
          return chosen ? [[option.id, chosen.id]] : []
        })),
        length: text(variant.dimensions?.length), width: text(variant.dimensions?.width), height: text(variant.dimensions?.height),
        dimensionUnit: variant.dimensions?.unit ?? 'CM', weightValue: text(variant.weight?.value), weightUnit: variant.weight?.unit ?? 'G',
        hasPolicy: policy !== null, isPerishable: policy?.isPerishable ?? false, shelfLifeHours: text(policy?.shelfLifeHours),
        returnPolicy: policy?.returnPolicy ?? '', advancePaymentPercent: text(policy?.advancePaymentPercent),
        innerLength: text(inner?.length), innerWidth: text(inner?.width), innerHeight: text(inner?.height), innerUnit: inner?.unit ?? 'CM',
        maxWeightValue: text(maxWeight?.value), maxWeightUnit: maxWeight?.unit ?? 'KG',
        components: (variant.bundle?.components ?? []).map((c) => ({
          componentVariantId: c.variantId, componentRole: c.componentRole, quantity: c.quantity, isRequired: c.isRequired,
        })),
        optionGroups: (variant.bundle?.optionGroups ?? []).map((g) => ({
          name: g.name, groupType: g.groupType, selectionType: g.selectionType, minSelections: text(g.minSelections),
          maxSelections: text(g.maxSelections), isRequired: g.isRequired,
          options: g.options.map((o) => ({ productVariantId: o.variantId, pricingMode: o.pricingMode, fixedPrice: text(o.fixedPrice) })),
        })),
      })
    }),
  }
}

const num = (value: string): number | null => (isBlank(value) ? null : Number(value))

function toDimensions(length: string, width: string, height: string, unit: Dimensions['unit']): Dimensions | null {
  return isBlank(length) ? null : { length: Number(length), width: Number(width), height: Number(height), unit }
}

const toWeight = (value: string, unit: Weight['unit']): Weight | null => (isBlank(value) ? null : { value: Number(value), unit })

function toVariantInput(variant: ProductFormValues['variants'][number], options: ProductFormValues['options'], productType: ProductType): VariantInput {
  const inner = toDimensions(variant.innerLength, variant.innerWidth, variant.innerHeight, variant.innerUnit)
  const maxWeight = toWeight(variant.maxWeightValue, variant.maxWeightUnit)
  return {
    ...(variant.id ? { id: variant.id } : {}),
    sku: variant.sku, price: variant.price, stockQuantity: variant.stockQuantity, status: variant.status,
    optionValueIds: options.flatMap((option) => (variant.optionChoices[option.id] ? [variant.optionChoices[option.id] as string] : [])),
    dimensions: toDimensions(variant.length, variant.width, variant.height, variant.dimensionUnit),
    weight: toWeight(variant.weightValue, variant.weightUnit),
    policy: variant.hasPolicy
      ? {
          isPerishable: variant.isPerishable, shelfLifeHours: num(variant.shelfLifeHours),
          returnPolicy: variant.returnPolicy === '' ? null : variant.returnPolicy, advancePaymentPercent: num(variant.advancePaymentPercent),
        }
      : null,
    giftBoxDetail: productType === 'READY_MADE_GIFT_BOX' && (inner || maxWeight) ? { inner, maxWeight } : null,
    bundle: productType === 'READY_MADE_GIFT_SET'
      ? {
          components: variant.components,
          optionGroups: variant.optionGroups.map((group) => ({
            name: group.name, groupType: group.groupType, selectionType: group.selectionType,
            minSelections: num(group.minSelections), maxSelections: num(group.maxSelections), isRequired: group.isRequired,
            options: group.options.map((option) => ({
              productVariantId: option.productVariantId, pricingMode: option.pricingMode,
              fixedPrice: option.pricingMode === 'FIXED_PRICE' ? num(option.fixedPrice) : null,
            })),
          })),
        }
      : null,
  }
}

/** Chuyển dữ liệu form đã hợp lệ thành payload API; ô trống lưu là null (cột DB cho phép NULL). */
export function toProductInput(values: ProductFormValues): ProductInput {
  const { description, variants, options, images, productType, isCustomBoxEligible, ...rest } = values
  return {
    ...rest,
    productType,
    description: description || null,
    isCustomBoxEligible: productType === 'REGULAR' && isCustomBoxEligible,
    images: images.map((image) => ({ imageUrl: image.imageUrl, isThumbnail: image.isThumbnail, productVariantId: image.productVariantId || null })),
    options: options.map((option) => ({ ...option, values: option.values.map((entry) => ({ ...entry, colorHex: entry.colorHex || null })) })),
    variants: variants.map((variant) => toVariantInput(variant, options, productType)),
  }
}
