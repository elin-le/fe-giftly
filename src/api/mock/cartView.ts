import type { Cart, CartItem, CartSelectionView } from '@/features/cart/types'
import { getThumbnailUrl, getVariantLabel } from '@/features/products/productRules'
import { calcAdvanceAmount, mergePolicies } from '@/features/products/policy'
import { findVariantRef, resolveProducts } from './catalogView'
import { getCart, type MockCartLine, type MockDb } from './db'

/** Phí vận chuyển cố định của mock khi giỏ có hàng (backend thật tự tính). */
export const SHIPPING_FEE = 30_000

function toVariantItem(db: MockDb, line: MockCartLine): CartItem | null {
  const ref = line.variantId ? findVariantRef(db, line.variantId) : undefined
  if (!ref) return null
  const { product, variant } = ref

  const resolved = resolveProducts(db).flatMap((p) => p.variants).find((candidate) => candidate.id === variant.id)
  const options = (resolved?.bundle?.optionGroups ?? []).flatMap((group) => group.options)

  const selections: CartSelectionView[] = line.selections.flatMap((selection) => {
    const option = options.find((candidate) => candidate.id === selection.bundleOptionId)
    if (!option) return []
    return [{
      bundleOptionId: option.id, productName: option.productName, optionLabel: option.optionLabel, pricingMode: option.pricingMode,
      quantity: selection.quantity ?? 1, unitPrice: option.price,
      messageText: selection.messageText ?? null, messageRenderingMethod: selection.messageRenderingMethod ?? null,
    }]
  })

  const componentPolicies = (variant.bundle?.components ?? []).map((c) => findVariantRef(db, c.variantId)?.variant.policy)
  const selectionPolicies = line.selections.map((s) => {
    const option = options.find((candidate) => candidate.id === s.bundleOptionId)
    return option ? findVariantRef(db, option.variantId)?.variant.policy : undefined
  })
  const policy = mergePolicies([variant.policy, ...componentPolicies, ...selectionPolicies])

  const unitPrice = variant.price + selections.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0)
  const subtotal = unitPrice * line.quantity
  return {
    id: line.id, quantity: line.quantity, unitPrice, subtotal,
    returnPolicy: policy.returnPolicy, advancePaymentPercent: policy.advancePaymentPercent,
    advanceAmount: calcAdvanceAmount(subtotal, policy.advancePaymentPercent),
    variant: {
      id: variant.id, productId: product.id, productName: product.name, sku: variant.sku,
      optionLabel: getVariantLabel(product, variant), imageUrl: getThumbnailUrl(product) ?? null,
      stockQuantity: variant.stockQuantity, isGiftSet: product.productType === 'READY_MADE_GIFT_SET', productType: product.productType,
    },
    selections,
    giftBox: null,
  }
}

function toGiftBoxItem(db: MockDb, line: MockCartLine): CartItem | null {
  const config = db.giftBoxConfigs.find((candidate) => candidate.view.id === line.giftBoxConfigId)
  if (!config) return null
  const { view } = config
  const subtotal = view.price * line.quantity
  return {
    id: line.id, quantity: line.quantity, unitPrice: view.price, subtotal,
    returnPolicy: view.returnPolicy, advancePaymentPercent: view.advancePaymentPercent,
    advanceAmount: calcAdvanceAmount(subtotal, view.advancePaymentPercent),
    variant: null, selections: [], giftBox: view,
  }
}

/** Giỏ hàng của người dùng dưới dạng API trả về; dòng tham chiếu biến thể đã bị xoá sẽ bị bỏ qua. */
export function buildCartView(db: MockDb, userId: string): Cart {
  const cart = getCart(db, userId)
  const items = cart.items.flatMap((line) => (line.variantId ? toVariantItem(db, line) : toGiftBoxItem(db, line)) ?? [])
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingFee = items.length === 0 ? 0 : SHIPPING_FEE
  const requiredAdvanceAmount = items.reduce((sum, item) => sum + item.advanceAmount, 0)
  return { id: cart.id, updatedAt: cart.updatedAt, items, subtotal, shippingFee, totalAmount: subtotal + shippingFee, requiredAdvanceAmount }
}
