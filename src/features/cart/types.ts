import type { GiftBoxView } from '@/features/gift-builder/types'
import type { MessageRenderingMethod, PricingMode, ProductType, ReturnPolicy } from '@/features/products/types'

/** Lựa chọn của khách trong một nhóm tuỳ chọn của set quà (`cart_item_option_selection`). */
export interface SelectionInput {
  bundleOptionId: string
  quantity?: number
  messageText?: string
  messageRenderingMethod?: MessageRenderingMethod
}

export interface CartSelectionView {
  bundleOptionId: string
  productName: string
  optionLabel: string | null
  pricingMode: PricingMode
  quantity: number
  /** Giá một đơn vị tính cho khách (0 khi miễn phí). */
  unitPrice: number
  messageText: string | null
  messageRenderingMethod: MessageRenderingMethod | null
}

export interface CartVariantRef {
  id: string
  productId: string
  productName: string
  sku: string
  /** "Hồng phấn · M" hoặc null. */
  optionLabel: string | null
  imageUrl: string | null
  stockQuantity: number
  isGiftSet: boolean
  productType: ProductType
}

export interface CartItemBase {
  id: string
  quantity: number
  /** Giá một đơn vị gồm cả các lựa chọn tính phí. */
  unitPrice: number
  subtotal: number
  returnPolicy: ReturnPolicy
  /** 0–100, tỷ lệ cao nhất trong các thành phần của dòng. */
  advancePaymentPercent: number
  advanceAmount: number
}

export type VariantCartItem = CartItemBase & { variant: CartVariantRef; selections: CartSelectionView[]; giftBox: null }
export type GiftBoxCartItem = CartItemBase & { variant: null; selections: []; giftBox: GiftBoxView }
export type CartItem = VariantCartItem | GiftBoxCartItem

export interface Cart {
  id: string
  updatedAt: string | null
  items: CartItem[]
  subtotal: number
  shippingFee: number
  totalAmount: number
  /** Tổng tiền đặt cọc phải trả ngay; 0 nếu không có dòng nào yêu cầu. */
  requiredAdvanceAmount: number
}

export type AddCartItemPayload =
  | { productVariantId: string; quantity: number; selections?: SelectionInput[] }
  | { giftBoxConfigId: string; quantity: number }
