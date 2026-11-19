import type {
  ComponentRole,
  Dimensions,
  MessageRenderingMethod,
  ProductType,
  ReturnPolicy,
  VariantPolicy,
  Weight,
} from '@/features/products/types'

/** Hộp chứa được chọn (một biến thể của READY_MADE_GIFT_BOX). */
export interface BoxChoice {
  variantId: string
  productId: string
  productName: string
  optionLabel: string | null
  price: number
  stockQuantity: number
  inner: Dimensions | null
  maxWeight: Weight | null
  policy: VariantPolicy | null
}

/** Một biến thể được bỏ vào hộp (`gift_box_config_item`). */
export interface BoxItem {
  variantId: string
  productId: string
  productName: string
  optionLabel: string | null
  productType: ProductType
  /** Giá niêm yết; phụ kiện đóng gói trong hộp tùy chỉnh được tính 0 (xem `getItemPrice`). */
  listPrice: number
  stockQuantity: number
  quantity: number
  dimensions: Dimensions | null
  weight: Weight | null
  policy: VariantPolicy | null
  /** Chỉ dùng với thiệp. */
  messageText: string
  messageRenderingMethod: MessageRenderingMethod
}

/** Bản nháp đang thiết kế (chỉ giữ trong bộ nhớ). */
export interface GiftBoxDraft {
  box: BoxChoice | null
  items: BoxItem[]
}

/** Một dòng của cấu hình đã lưu, với giá do server tính. */
export interface GiftBoxLine {
  variantId: string
  productId: string
  productName: string
  optionLabel: string | null
  productType: ProductType
  role: ComponentRole
  listPrice: number
  /** Giá tính cho khách (0 nếu miễn phí). */
  unitPrice: number
  isComplimentary: boolean
  quantity: number
  messageText: string | null
  messageRenderingMethod: MessageRenderingMethod | null
}

/** NOT_REQUIRED: vừa hộp · PENDING: vượt nhẹ, chờ admin duyệt (khách vẫn sửa được) · APPROVED: đã duyệt, khoá sửa · REJECTED: cần khách chỉnh lại. */
export const GIFT_BOX_REVIEW_STATUSES = ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'] as const
export type GiftBoxReviewStatus = (typeof GIFT_BOX_REVIEW_STATUSES)[number]

/** `gift_box_config` đã lưu kèm giá và chính sách do server tính. */
export interface GiftBoxView {
  id: string
  box: GiftBoxLine
  items: GiftBoxLine[]
  price: number
  returnPolicy: ReturnPolicy
  advancePaymentPercent: number
  reviewStatus: GiftBoxReviewStatus
  /** Lý do cần duyệt (tự sinh) hoặc phản hồi của admin. */
  reviewNote: string | null
  /** Tỷ lệ dùng sức chứa (1 = vừa đủ); null nếu hộp thiếu số đo. */
  capacityRatio: number | null
}

export interface GiftBoxItemInput {
  productVariantId: string
  quantity: number
  messageText?: string
  messageRenderingMethod?: MessageRenderingMethod
}

export interface GiftBoxPayload {
  boxVariantId: string
  items: GiftBoxItemInput[]
}

/** Một yêu cầu hộp quà tùy chỉnh trong trang quản trị (kèm khách và đơn liên quan để admin liên hệ). */
export interface GiftBoxRequest {
  id: string
  customer: { id: string; fullName: string; email: string; phone: string | null }
  view: GiftBoxView
  inner: Dimensions | null
  maxWeight: Weight | null
  /** Đơn đã đặt chứa hộp này (nếu có). */
  orderId: string | null
  orderNumber: string | null
  updatedAt: string
}

export interface GiftBoxReviewDecision {
  decision: 'APPROVED' | 'REJECTED'
  note?: string
}
