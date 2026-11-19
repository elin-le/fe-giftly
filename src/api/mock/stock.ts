import { describeVariant, findVariantRef } from './catalogView'
import type { MockCartLine, MockDb } from './db'

const add = (demand: Map<string, number>, variantId: string, quantity: number) =>
  demand.set(variantId, (demand.get(variantId) ?? 0) + quantity)

/**
 * Nhu cầu tồn kho theo biến thể của các dòng giỏ hàng. Phụ kiện miễn phí vẫn bị trừ kho.
 * Với set quà (đã lắp sẵn): chỉ trừ tồn kho của biến thể set; thành phần cố định không bị trừ lần hai,
 * còn lựa chọn thêm (thiệp, phụ kiện) vẫn trừ kho riêng.
 */
export function collectDemand(db: MockDb, lines: readonly MockCartLine[]): Map<string, number> {
  const demand = new Map<string, number>()

  for (const line of lines) {
    if (line.variantId) {
      add(demand, line.variantId, line.quantity)
      const ref = findVariantRef(db, line.variantId)
      for (const selection of line.selections) {
        const option = ref?.variant.bundle?.optionGroups.flatMap((group) => group.options).find((o) => o.id === selection.bundleOptionId)
        if (option) add(demand, option.variantId, (selection.quantity ?? 1) * line.quantity)
      }
    } else {
      const config = db.giftBoxConfigs.find((candidate) => candidate.view.id === line.giftBoxConfigId)
      if (!config) continue
      for (const item of [config.view.box, ...config.view.items]) add(demand, item.variantId, item.quantity * line.quantity)
    }
  }
  return demand
}

/** Thông báo của vấn đề tồn kho đầu tiên (không còn bán / không đủ hàng), hoặc `null` nếu đủ hàng. */
export function findStockProblem(db: MockDb, demand: ReadonlyMap<string, number>): string | null {
  for (const [variantId, quantity] of demand) {
    const ref = findVariantRef(db, variantId)
    if (!ref || ref.product.status === 'DISCONTINUED' || ref.variant.status === 'DISCONTINUED') return 'Có sản phẩm không còn được bán'
    const name = describeVariant(ref)
    if (ref.product.status !== 'AVAILABLE' || ref.variant.status !== 'AVAILABLE' || ref.variant.stockQuantity === 0) return `"${name}" đã hết hàng`
    if (quantity > ref.variant.stockQuantity) return `"${name}" chỉ còn ${ref.variant.stockQuantity} sản phẩm`
  }
  return null
}

/** `direction` = -1: trừ kho khi đặt hàng; +1: hoàn kho khi huỷ đơn. */
export function adjustStock(db: MockDb, demand: ReadonlyMap<string, number>, direction: 1 | -1): void {
  db.products = db.products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => {
      const quantity = demand.get(variant.id)
      if (!quantity) return variant
      const stockQuantity = variant.stockQuantity + direction * quantity
      const status = variant.status === 'DISCONTINUED' ? variant.status : stockQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
      return { ...variant, stockQuantity, status }
    }),
  }))
}
