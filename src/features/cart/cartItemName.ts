import type { CartItem } from './types'

/** Tên hiển thị của một dòng giỏ hàng: "Sản phẩm (biến thể)" hoặc "Hộp quà tùy chỉnh · <tên hộp>". */
export function getCartItemName(item: CartItem): string {
  if (item.variant) return item.variant.optionLabel ? `${item.variant.productName} (${item.variant.optionLabel})` : item.variant.productName
  return `Hộp quà tùy chỉnh · ${item.giftBox.box.productName}`
}
