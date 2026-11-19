import type { Address } from '@/features/addresses/types'
import type { ComponentRole, MessageRenderingMethod, ReturnPolicy } from '@/features/products/types'

export const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PROCESSING',
  'PACKAGING',
  'READY_TO_SHIP',
  'SHIPPING',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'FAILED',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  PACKAGING: 'Đang đóng gói',
  READY_TO_SHIP: 'Sẵn sàng giao',
  SHIPPING: 'Đang vận chuyển',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
  RETURN_REQUESTED: 'Yêu cầu trả hàng',
  RETURNED: 'Đã trả hàng',
  FAILED: 'Giao thất bại',
}

export const PAYMENT_METHODS = ['COD', 'BANK_TRANSFER', 'E_WALLET', 'CREDIT_CARD', 'DEBIT_CARD'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng (mô phỏng)',
  E_WALLET: 'Ví điện tử (mô phỏng)',
  CREDIT_CARD: 'Thẻ tín dụng (mô phỏng)',
  DEBIT_CARD: 'Thẻ ghi nợ (mô phỏng)',
}

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
}

export const PAYMENT_STAGES = ['FULL_PAYMENT', 'ADVANCE_PAYMENT', 'REMAINING_PAYMENT'] as const
export type PaymentStage = (typeof PAYMENT_STAGES)[number]

export const PAYMENT_STAGE_LABELS: Record<PaymentStage, string> = {
  FULL_PAYMENT: 'Thanh toán toàn bộ',
  ADVANCE_PAYMENT: 'Đặt cọc',
  REMAINING_PAYMENT: 'Thanh toán phần còn lại',
}

/** `order_item_component`: thành phần của set quà / hộp tùy chỉnh — chỉ lưu snapshot tại thời điểm đặt. */
export interface OrderItemComponent {
  id: string
  productVariantId: string | null
  /** Dùng để đánh giá theo `product_id`; backend lấy từ variant. */
  productId: string | null
  componentRole: ComponentRole | null
  productNameSnapshot: string
  skuSnapshot: string | null
  variantSnapshot: Record<string, string> | null
  quantity: number
  unitPrice: number
  isComplimentary: boolean
  messageText: string | null
  messageRenderingMethod: MessageRenderingMethod | null
  returnPolicySnapshot: ReturnPolicy | null
  advancePaymentPercentSnapshot: number | null
  isPerishableSnapshot: boolean | null
  shelfLifeHoursSnapshot: number | null
}

/** `order_item`: đúng MỘT trong `productVariantId` / `giftBoxConfigId`; chỉ đọc snapshot, không tính lại từ giá hiện tại. */
export interface OrderItem {
  id: string
  productVariantId: string | null
  productId: string | null
  giftBoxConfigId: string | null
  itemNameSnapshot: string
  skuSnapshot: string | null
  variantSnapshot: Record<string, string> | null
  unitPrice: number
  quantity: number
  subtotal: number
  returnPolicySnapshot: ReturnPolicy | null
  advancePaymentPercentSnapshot: number | null
  isPerishableSnapshot: boolean | null
  shelfLifeHoursSnapshot: number | null
  requiredAdvanceAmount: number | null
  /** Rỗng với sản phẩm lẻ. */
  components: OrderItemComponent[]
}

/** `payment`: một đơn có thể có nhiều lần thanh toán (cọc + phần còn lại). */
export interface Payment {
  id: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentStage: PaymentStage
  amount: number
  paidAt: string | null
}

export interface OrderCustomer {
  id: string
  fullName: string
  email: string
}

export interface Order {
  id: string
  userId: string
  customer: OrderCustomer
  address: Address
  orderNumber: string
  subtotal: number
  shippingFee: number
  /** = subtotal + shippingFee. */
  totalAmount: number
  requiredAdvanceAmount: number | null
  status: OrderStatus
  orderedAt: string
  items: OrderItem[]
  payments: Payment[]
}

/** Đơn được tạo từ giỏ hàng của người dùng hiện tại. */
export interface CreateOrderPayload {
  addressId: string
  paymentMethod: PaymentMethod
}

/** `review`: gắn với dòng đơn HOẶC thành phần trong set/hộp (nhưng không cả hai). */
export interface Review {
  id: string
  userId: string
  userName: string
  productId: string
  productVariantId: string | null
  orderItemId: string | null
  orderItemComponentId: string | null
  rating: number
  title: string | null
  comment: string | null
  createdAt: string
}

export interface ReviewPayload {
  orderItemId?: string
  orderItemComponentId?: string
  rating: number
  title?: string
  comment?: string
}
