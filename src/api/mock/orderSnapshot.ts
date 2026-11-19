import type { CartItem } from '@/features/cart/types'
import type { OrderItem, OrderItemComponent } from '@/features/orders/types'
import { mergePolicies } from '@/features/products/policy'
import { getVariantAttributes } from '@/features/products/productRules'
import type { ComponentRole, MessageRenderingMethod } from '@/features/products/types'
import { findVariantRef, resolveProducts } from './catalogView'
import { newId, type MockCartLine, type MockDb } from './db'

interface ComponentSpec {
  variantId: string
  role: ComponentRole
  quantity: number
  unitPrice: number
  isComplimentary: boolean
  messageText?: string | null
  messageRenderingMethod?: MessageRenderingMethod | null
}

/** Chụp thành phần tại thời điểm đặt (`order_item_component`): tên, SKU, thuộc tính, chính sách. */
function snapshotComponent(db: MockDb, spec: ComponentSpec): OrderItemComponent {
  const ref = findVariantRef(db, spec.variantId)
  const policy = ref?.variant.policy
  return {
    id: newId(),
    productVariantId: spec.variantId,
    productId: ref?.product.id ?? null,
    componentRole: spec.role,
    productNameSnapshot: ref?.product.name ?? '',
    skuSnapshot: ref?.variant.sku ?? null,
    variantSnapshot: ref ? orNull(getVariantAttributes(ref.product, ref.variant)) : null,
    quantity: spec.quantity,
    unitPrice: spec.unitPrice,
    isComplimentary: spec.isComplimentary,
    messageText: spec.messageText ?? null,
    messageRenderingMethod: spec.messageRenderingMethod ?? null,
    returnPolicySnapshot: policy?.returnPolicy ?? null,
    advancePaymentPercentSnapshot: policy?.advancePaymentPercent ?? null,
    isPerishableSnapshot: policy?.isPerishable ?? null,
    shelfLifeHoursSnapshot: policy?.shelfLifeHours ?? null,
  }
}

const orNull = (attributes: Record<string, string>) => (Object.keys(attributes).length > 0 ? attributes : null)

function componentSpecs(db: MockDb, line: MockCartLine, item: CartItem): ComponentSpec[] {
  if (item.giftBox) {
    return [item.giftBox.box, ...item.giftBox.items].map((l) => ({
      variantId: l.variantId, role: l.role, quantity: l.quantity, unitPrice: l.unitPrice, isComplimentary: l.isComplimentary,
      messageText: l.messageText, messageRenderingMethod: l.messageRenderingMethod,
    }))
  }

  const variantId = line.variantId as string
  const resolved = resolveProducts(db).flatMap((p) => p.variants).find((v) => v.id === variantId)
  // Thành phần cố định nằm trong giá set nên đơn giá 0; chỉ phụ kiện được đánh dấu miễn phí.
  const fixed = (resolved?.bundle?.components ?? []).map((c) => ({
    variantId: c.variantId, role: c.componentRole, quantity: c.quantity, unitPrice: 0, isComplimentary: c.componentRole === 'ACCESSORY',
  }))
  const options = (resolved?.bundle?.optionGroups ?? []).flatMap((g) => g.options)
  const chosen = item.selections.flatMap((selection) => {
    const option = options.find((o) => o.id === selection.bundleOptionId)
    if (!option) return []
    return [{
      variantId: option.variantId, role: (option.productType === 'GREETING_CARD' ? 'GREETING_CARD' : 'ACCESSORY') as ComponentRole,
      quantity: selection.quantity, unitPrice: selection.unitPrice, isComplimentary: selection.unitPrice === 0,
      messageText: selection.messageText, messageRenderingMethod: selection.messageRenderingMethod,
    }]
  })
  return [...fixed, ...chosen]
}

/** Dòng giỏ → `order_item` bất biến: đơn hàng sau đó chỉ đọc snapshot, không tính lại từ giá hiện tại. */
export function snapshotOrderItem(db: MockDb, line: MockCartLine, item: CartItem): OrderItem {
  const components = componentSpecs(db, line, item).map((spec) => snapshotComponent(db, spec))
  const ref = item.variant ? findVariantRef(db, item.variant.id) : undefined
  const merged = mergePolicies([ref?.variant.policy, ...components.map((c) => ({
    isPerishable: c.isPerishableSnapshot ?? false, shelfLifeHours: c.shelfLifeHoursSnapshot,
    returnPolicy: c.returnPolicySnapshot, advancePaymentPercent: c.advancePaymentPercentSnapshot,
  }))])

  return {
    id: newId(),
    productVariantId: item.variant?.id ?? null,
    productId: item.variant?.productId ?? null,
    giftBoxConfigId: item.giftBox?.id ?? null,
    itemNameSnapshot: item.variant?.productName ?? 'Hộp quà tùy chỉnh',
    skuSnapshot: item.variant?.sku ?? null,
    variantSnapshot: ref ? orNull(getVariantAttributes(ref.product, ref.variant)) : null,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
    returnPolicySnapshot: item.returnPolicy,
    advancePaymentPercentSnapshot: item.advancePaymentPercent > 0 ? item.advancePaymentPercent : null,
    isPerishableSnapshot: merged.isPerishable,
    shelfLifeHoursSnapshot: merged.shelfLifeHours,
    requiredAdvanceAmount: item.advanceAmount > 0 ? item.advanceAmount : null,
    components,
  }
}
