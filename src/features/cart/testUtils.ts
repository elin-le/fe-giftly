import type { Cart, CartItem, GiftBoxCartItem, VariantCartItem } from './types'

const policy = { returnPolicy: 'RETURNABLE', advancePaymentPercent: 0, advanceAmount: 0 } as const

export const makeVariantItem = (overrides: Partial<VariantCartItem> = {}): VariantCartItem => ({
  id: 'ci1',
  quantity: 1,
  unitPrice: 100000,
  subtotal: 100000,
  ...policy,
  variant: { id: 'v1', productId: 'p1', productName: 'Nến thơm Hoa Nhài', sku: 'CANDLE-100', optionLabel: null, imageUrl: null, stockQuantity: 10, isGiftSet: false, productType: 'REGULAR' },
  selections: [],
  giftBox: null,
  ...overrides,
})

export const makeGiftBoxItem = (overrides: Partial<GiftBoxCartItem> = {}): GiftBoxCartItem => ({
  id: 'ci2',
  quantity: 1,
  unitPrice: 230000,
  subtotal: 230000,
  ...policy,
  variant: null,
  selections: [],
  giftBox: {
    id: 'gb1',
    price: 230000,
    returnPolicy: 'RETURNABLE',
    advancePaymentPercent: 0,
    reviewStatus: 'NOT_REQUIRED',
    reviewNote: null,
    capacityRatio: null,
    box: { variantId: 'bx1', productId: 'bx', productName: 'Hộp Giftly', optionLabel: 'S', productType: 'READY_MADE_GIFT_BOX', role: 'BOX', listPrice: 60000, unitPrice: 60000, isComplimentary: false, quantity: 1, messageText: null, messageRenderingMethod: null },
    items: [
      { variantId: 'g1', productId: 'g', productName: 'Trà thảo mộc', optionLabel: null, productType: 'REGULAR', role: 'PRODUCT', listPrice: 85000, unitPrice: 85000, isComplimentary: false, quantity: 2, messageText: null, messageRenderingMethod: null },
      { variantId: 'k1', productId: 'k', productName: 'Thiệp viết tay', optionLabel: null, productType: 'GREETING_CARD', role: 'GREETING_CARD', listPrice: 0, unitPrice: 0, isComplimentary: true, quantity: 1, messageText: 'Chúc mừng sinh nhật', messageRenderingMethod: 'HANDWRITTEN' },
    ],
  },
  ...overrides,
})

/** Dựng giỏ hàng; tổng tiền tự tính từ các dòng (phí ship 30.000₫ trừ khi giỏ trống). */
export function makeCart(items: CartItem[] = [], overrides: Partial<Cart> = {}): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingFee = items.length === 0 ? 0 : 30000
  const requiredAdvanceAmount = items.reduce((sum, item) => sum + item.advanceAmount, 0)
  return { id: 'cart1', updatedAt: null, items, subtotal, shippingFee, totalAmount: subtotal + shippingFee, requiredAdvanceAmount, ...overrides }
}
