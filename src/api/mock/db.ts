import type { Cart } from '@/features/cart/types'
import type { SelectionInput } from '@/features/cart/types'
import type { GiftBoxView } from '@/features/gift-builder/types'
import type { Order, Review } from '@/features/orders/types'
import type { Category, Product } from '@/features/products/types'
import {
  seedAddresses,
  seedCategories,
  seedOrders,
  seedProducts,
  seedReviews,
  seedUsers,
  type SeedAddress,
  type SeedUser,
} from './data'

/** `cart_item` + `cart_item_option_selection`; đúng một trong `variantId` / `giftBoxConfigId`. */
export interface MockCartLine {
  id: string
  variantId: string | null
  giftBoxConfigId: string | null
  quantity: number
  selections: SelectionInput[]
}

export interface MockCart {
  id: string
  userId: string
  updatedAt: string | null
  items: MockCartLine[]
}

export interface MockGiftBoxConfig {
  userId: string
  view: GiftBoxView
  updatedAt: string
}

/** Toàn bộ dữ liệu của backend giả lập — mỗi lần `installMockApi` tạo một bản mới. */
export interface MockDb {
  users: SeedUser[]
  /** token → userId */
  sessions: Map<string, string>
  categories: Category[]
  products: Product[]
  addresses: SeedAddress[]
  carts: MockCart[]
  giftBoxConfigs: MockGiftBoxConfig[]
  orders: Order[]
  reviews: Review[]
  /** orderId → nhu cầu tồn kho (variantId → số lượng) để hoàn kho khi huỷ đơn. */
  orderDemand: Map<string, Map<string, number>>
  orderSeq: number
}

export const newId = (): string => crypto.randomUUID()

export function createDb(): MockDb {
  return {
    users: structuredClone(seedUsers),
    sessions: new Map(),
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    addresses: structuredClone(seedAddresses),
    carts: [],
    giftBoxConfigs: [],
    orders: structuredClone(seedOrders),
    reviews: structuredClone(seedReviews),
    orderDemand: new Map(),
    orderSeq: seedOrders.length,
  }
}

/** Mỗi người dùng có đúng một giỏ hàng (`cart.user_id`); tạo khi cần. */
export function getCart(db: MockDb, userId: string): MockCart {
  const existing = db.carts.find((cart) => cart.userId === userId)
  if (existing) return existing
  const created: MockCart = { id: newId(), userId, updatedAt: null, items: [] }
  db.carts.push(created)
  return created
}

export type { Cart }
