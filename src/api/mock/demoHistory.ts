import type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/features/orders/types'
import type { Product } from '@/features/products/types'
import type { SeedUser } from './data'
import type { MockDb } from './db'

const DAY_MS = 24 * 60 * 60 * 1000
const HISTORY_DAYS = 60
const SHIPPING_FEE = 30_000

const DEMO_NAMES = ['Trần Thu Hà', 'Lê Quốc Bảo', 'Phạm Ngọc Lan', 'Võ Gia Hân', 'Đặng Minh Khoa', 'Bùi Thanh Tâm']
const METHODS: PaymentMethod[] = ['COD', 'BANK_TRANSFER', 'E_WALLET', 'CREDIT_CARD']
const FINISHED: OrderStatus[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'DELIVERED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'RETURNED']

/** Bộ sinh số giả ngẫu nhiên có hạt giống: dữ liệu demo giống nhau mỗi lần chạy. */
function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const pick = <T,>(random: () => number, list: readonly T[]): T => list[Math.floor(random() * list.length)]!

function toItem(product: Product, variantIndex: number, quantity: number, index: number): OrderItem {
  const variant = product.variants[variantIndex % product.variants.length]!
  return {
    id: `demo-item-${index}-${variant.id}`, productVariantId: variant.id, productId: product.id, giftBoxConfigId: null,
    itemNameSnapshot: product.name, skuSnapshot: variant.sku, variantSnapshot: null, unitPrice: variant.price, quantity,
    subtotal: variant.price * quantity, returnPolicySnapshot: variant.policy?.returnPolicy ?? 'RETURNABLE',
    advancePaymentPercentSnapshot: null, isPerishableSnapshot: variant.policy?.isPerishable ?? false,
    shelfLifeHoursSnapshot: variant.policy?.shelfLifeHours ?? null, requiredAdvanceAmount: null, components: [],
  }
}

/**
 * Thêm khách và đơn hàng lịch sử (60 ngày gần nhất) để Dashboard/Analytics có số liệu sinh động khi phát triển.
 * Chỉ ghi vào `db` — không trừ kho, không ảnh hưởng giỏ hàng hay đơn mẫu có sẵn.
 */
export function addDemoHistory(db: MockDb, now = Date.now()): void {
  const random = createRandom(20260601)
  const sellable = db.products.filter((p) => p.status !== 'DISCONTINUED' && p.productType !== 'READY_MADE_GIFT_BOX' && p.variants.length > 0)
  if (sellable.length === 0) return

  const customers: SeedUser[] = DEMO_NAMES.map((fullName, i) => ({
    id: `00000001-0000-4000-8000-${String(100 + i).padStart(12, '0')}`,
    email: `demo${i + 1}@example.com`, password: 'Demo@1234', fullName, phone: `09000000${String(10 + i)}`, status: 'ACTIVE', roles: ['ROLE_USER'],
  }))
  db.users.push(...customers)

  const orders: Order[] = []
  for (let n = 0; n < 70; n++) {
    // Nghiêng về các ngày gần đây để biểu đồ có xu hướng tăng.
    const daysAgo = Math.floor((1 - Math.sqrt(random())) * HISTORY_DAYS)
    const orderedAt = new Date(now - daysAgo * DAY_MS - Math.floor(random() * 12) * 3_600_000).toISOString()
    const customer = pick(random, customers)
    const items = Array.from({ length: 1 + Math.floor(random() * 3) }, (_, i) =>
      toItem(pick(random, sellable), Math.floor(random() * 3), 1 + Math.floor(random() * 2), n * 10 + i),
    )
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const status = daysAgo < 3 ? pick(random, ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'] as const) : daysAgo < 8 ? pick(random, ['SHIPPING', 'DELIVERED', 'PACKAGING'] as const) : pick(random, FINISHED)
    const method = pick(random, METHODS)
    const totalAmount = subtotal + SHIPPING_FEE
    orders.push({
      id: `00000006-0000-4000-8000-${String(1000 + n).padStart(12, '0')}`, userId: customer.id,
      customer: { id: customer.id, fullName: customer.fullName, email: customer.email },
      address: { id: 'demo-address', recipientName: customer.fullName, phone: customer.phone ?? '', addressLine: '1 Nguyễn Trãi', ward: null, district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: true },
      orderNumber: `GFT-D${String(n + 1).padStart(3, '0')}`, subtotal, shippingFee: SHIPPING_FEE, totalAmount, requiredAdvanceAmount: null, status, orderedAt, items,
      payments: [{ id: `demo-pay-${n}`, paymentMethod: method, paymentStatus: status === 'COMPLETED' || status === 'DELIVERED' ? 'PAID' : 'PENDING', paymentStage: 'FULL_PAYMENT', amount: totalAmount, paidAt: null }],
    })
  }
  db.orders.push(...orders)
}
