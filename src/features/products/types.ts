export const PRODUCT_TYPES = [
  'REGULAR',
  'READY_MADE_GIFT_SET',
  'READY_MADE_GIFT_BOX',
  'PACKAGING_ACCESSORY',
  'GREETING_CARD',
] as const
/**
 * REGULAR: sản phẩm lẻ · READY_MADE_GIFT_SET: set quà có cấu trúc bundle · READY_MADE_GIFT_BOX: hộp quà bán riêng
 * (cũng là hộp chứa của Custom Box) · PACKAGING_ACCESSORY: phụ kiện đóng gói · GREETING_CARD: thiệp.
 */
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  REGULAR: 'Sản phẩm lẻ',
  READY_MADE_GIFT_SET: 'Set quà',
  READY_MADE_GIFT_BOX: 'Hộp quà',
  PACKAGING_ACCESSORY: 'Phụ kiện đóng gói',
  GREETING_CARD: 'Thiệp chúc mừng',
}

export const PRODUCT_STATUSES = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: 'Đang bán',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng bán',
}

export const DIMENSION_UNITS = ['MM', 'CM', 'M'] as const
export type DimensionUnit = (typeof DIMENSION_UNITS)[number]

export const WEIGHT_UNITS = ['G', 'KG'] as const
export type WeightUnit = (typeof WEIGHT_UNITS)[number]

export const RETURN_POLICIES = ['RETURNABLE', 'NO_RETURN'] as const
export type ReturnPolicy = (typeof RETURN_POLICIES)[number]

export const RETURN_POLICY_LABELS: Record<ReturnPolicy, string> = {
  RETURNABLE: 'Được đổi trả',
  NO_RETURN: 'Không đổi trả',
}

/** Vai trò của một thành phần trong set quà / hộp tùy chỉnh (`component_role`). */
export const COMPONENT_ROLES = ['BOX', 'PRODUCT', 'ACCESSORY', 'GREETING_CARD'] as const
export type ComponentRole = (typeof COMPONENT_ROLES)[number]

export const COMPONENT_ROLE_LABELS: Record<ComponentRole, string> = {
  BOX: 'Hộp',
  PRODUCT: 'Món quà',
  ACCESSORY: 'Phụ kiện',
  GREETING_CARD: 'Thiệp',
}

export const MESSAGE_RENDERING_METHODS = ['HANDWRITTEN', 'PRINTED'] as const
export type MessageRenderingMethod = (typeof MESSAGE_RENDERING_METHODS)[number]

export const MESSAGE_RENDERING_LABELS: Record<MessageRenderingMethod, string> = {
  HANDWRITTEN: 'Viết tay',
  PRINTED: 'In',
}

export interface Category {
  id: string
  name: string
  description: string | null
}

/** Ảnh sản phẩm (lưu trên Cloudinary). */
export interface ProductImage {
  id: string
  imageUrl: string
  secureUrl: string
  publicId: string
  isThumbnail: boolean
  /** null: ảnh chung của sản phẩm; có giá trị: ảnh riêng của biến thể. */
  productVariantId: string | null
}

/** Kích thước vật lý; chỉ có khi đủ chiều dài, rộng, cao và đơn vị. */
export interface Dimensions {
  length: number
  width: number
  height: number
  unit: DimensionUnit
}

export interface Weight {
  value: number
  unit: WeightUnit
}

export interface ProductOptionValue {
  id: string
  value: string
  colorHex: string | null
}

/** Một trục lựa chọn của sản phẩm, ví dụ "Màu", "Size". */
export interface ProductOption {
  id: string
  name: string
  displayOrder: number | null
  values: ProductOptionValue[]
}

/** `product_variant_policy`: hạn dùng, đổi trả, đặt cọc. */
export interface VariantPolicy {
  isPerishable: boolean
  shelfLifeHours: number | null
  returnPolicy: ReturnPolicy | null
  /** 0–100; null nghĩa là không đặt cọc. */
  advancePaymentPercent: number | null
}

/** `gift_box_variant_detail`: lòng hộp và tải trọng (chỉ với biến thể của READY_MADE_GIFT_BOX). */
export interface GiftBoxDetail {
  inner: Dimensions | null
  maxWeight: Weight | null
}

export const PRICING_MODES = ['FREE', 'PRODUCT_PRICE', 'FIXED_PRICE'] as const
export type PricingMode = (typeof PRICING_MODES)[number]

export const OPTION_GROUP_TYPES = ['GREETING_CARD', 'PACKAGING_ACCESSORY', 'OTHER'] as const
export type OptionGroupType = (typeof OPTION_GROUP_TYPES)[number]

export const SELECTION_TYPES = ['SINGLE', 'MULTIPLE'] as const
export type SelectionType = (typeof SELECTION_TYPES)[number]

/** `bundle_component`: thành phần cố định của set quà. */
export interface BundleComponent {
  id: string
  variantId: string
  productId: string
  productName: string
  optionLabel: string | null
  componentRole: ComponentRole
  quantity: number
  isRequired: boolean
  /** Chính sách của biến thể thành phần (để gộp chính sách cho cả set). */
  policy: VariantPolicy | null
}

/** `bundle_option`: một lựa chọn trong nhóm tuỳ chọn; `price` là giá khách phải trả theo `pricingMode`. */
export interface BundleOption {
  id: string
  variantId: string
  productId: string
  productName: string
  optionLabel: string | null
  productType: ProductType
  pricingMode: PricingMode
  fixedPrice: number | null
  price: number
  stockQuantity: number
  policy: VariantPolicy | null
}

export interface BundleOptionGroup {
  id: string
  name: string
  displayOrder: number | null
  groupType: OptionGroupType
  selectionType: SelectionType
  minSelections: number | null
  maxSelections: number | null
  isRequired: boolean
  options: BundleOption[]
}

export interface Bundle {
  components: BundleComponent[]
  optionGroups: BundleOptionGroup[]
}

/** `product_variant`: đơn vị bán thực tế — giá, tồn kho và SKU nằm ở đây. */
export interface ProductVariant {
  id: string
  productId: string
  sku: string
  price: number
  stockQuantity: number
  status: ProductStatus
  dimensions: Dimensions | null
  weight: Weight | null
  /** Các giá trị tùy chọn xác định biến thể này (mỗi `ProductOption` đúng một giá trị). */
  optionValueIds: string[]
  policy: VariantPolicy | null
  giftBoxDetail: GiftBoxDetail | null
  /** Chỉ có ở biến thể của READY_MADE_GIFT_SET. */
  bundle: Bundle | null
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string | null
  productType: ProductType
  status: ProductStatus
  /** Sản phẩm REGULAR chỉ được đưa vào hộp tùy chỉnh khi cờ này bật. */
  isCustomBoxEligible: boolean
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
  /** Điểm trung bình theo `product_id`, gộp mọi biến thể; null khi chưa có đánh giá. */
  ratingAverage: number | null
  reviewCount: number
}

/** Ảnh admin gửi lên: backend thật upload lên Cloudinary; mock lưu thẳng URL. */
export interface ImageInput {
  imageUrl: string
  isThumbnail: boolean
  /** null: ảnh chung; có giá trị: ảnh riêng của một biến thể đã có (ví dụ theo màu). */
  productVariantId: string | null
}

/** Giá trị tuỳ chọn; `id` do client sinh (UUID) với giá trị mới để biến thể tham chiếu được trong cùng lần lưu. */
export interface OptionValueInput {
  id: string
  value: string
  colorHex: string | null
}

/** Tuỳ chọn của sản phẩm; thứ tự trong mảng chính là `display_order`. */
export interface OptionInput {
  id: string
  name: string
  values: OptionValueInput[]
}

export interface BundleComponentInput {
  componentVariantId: string
  componentRole: ComponentRole
  quantity: number
  isRequired: boolean
}

export interface BundleOptionInput {
  productVariantId: string
  pricingMode: PricingMode
  /** Chỉ có (và bắt buộc) khi `pricingMode = FIXED_PRICE`. */
  fixedPrice: number | null
}

export interface BundleOptionGroupInput {
  name: string
  groupType: OptionGroupType
  selectionType: SelectionType
  minSelections: number | null
  maxSelections: number | null
  isRequired: boolean
  options: BundleOptionInput[]
}

export interface BundleInput {
  components: BundleComponentInput[]
  optionGroups: BundleOptionGroupInput[]
}

/** Biến thể admin chỉnh sửa; tạo mới thì không có `id`. */
export interface VariantInput {
  id?: string
  sku: string
  price: number
  stockQuantity: number
  status: ProductStatus
  /** Mỗi tuỳ chọn của sản phẩm đúng một giá trị. */
  optionValueIds: string[]
  dimensions: Dimensions | null
  weight: Weight | null
  policy: VariantPolicy | null
  /** Chỉ với READY_MADE_GIFT_BOX. */
  giftBoxDetail: GiftBoxDetail | null
  /** Chỉ với READY_MADE_GIFT_SET. */
  bundle: BundleInput | null
}

/** Dữ liệu admin gửi khi tạo / sửa sản phẩm (thay toàn bộ ảnh, tuỳ chọn và biến thể). */
export interface ProductInput {
  categoryId: string
  name: string
  description: string | null
  productType: ProductType
  status: ProductStatus
  isCustomBoxEligible: boolean
  images: ImageInput[]
  options: OptionInput[]
  variants: VariantInput[]
}

export interface ProductQuery {
  search?: string
  categoryId?: string
  productType?: ProductType
}
