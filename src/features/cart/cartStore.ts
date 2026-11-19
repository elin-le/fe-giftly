import { create } from 'zustand'
import { toApiError } from '@/api/errors'
import { cartApi } from './api/cartApi'
import type { Cart, SelectionInput } from './types'

interface CartState {
  /** Giỏ hàng trên server của người dùng hiện tại; `null` khi chưa tải/chưa đăng nhập. */
  cart: Cart | null
  isLoading: boolean
  /** Lỗi tải giỏ hàng (các thao tác ghi báo lỗi bằng cách ném ApiError cho nơi gọi). */
  error: string | null
  /** Số thao tác ghi đang chờ; > 0 nghĩa là đang đồng bộ với server. */
  pendingCount: number
  load: () => Promise<void>
  addVariant: (variantId: string, quantity?: number, selections?: SelectionInput[]) => Promise<void>
  addGiftBox: (giftBoxConfigId: string) => Promise<void>
  /** Số lượng ≤ 0 sẽ xoá dòng. */
  setQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  /** Dùng khi đăng xuất / đổi tài khoản. */
  reset: () => void
}

/**
 * Tăng mỗi lần reset: phản hồi của request phát đi *trước* khi đăng xuất không được ghi vào giỏ
 * của phiên mới (tránh lộ giỏ hàng của người trước).
 */
let epoch = 0

/** Các thao tác ghi chạy tuần tự để phản hồi về không bị đảo thứ tự (giỏ hàng hiển thị luôn là bản mới nhất). */
let queue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task)
  queue = result.catch(() => undefined)
  return result
}

export const useCartStore = create<CartState>()((set) => {
  const mutate = async (request: () => Promise<Cart>): Promise<void> => {
    const startEpoch = epoch
    set((state) => ({ pendingCount: state.pendingCount + 1 }))
    try {
      const cart = await enqueue(request)
      if (startEpoch === epoch) set({ cart, error: null })
    } finally {
      if (startEpoch === epoch) set((state) => ({ pendingCount: Math.max(state.pendingCount - 1, 0) }))
    }
  }

  return {
    cart: null,
    isLoading: false,
    error: null,
    pendingCount: 0,

    load: async () => {
      const startEpoch = epoch
      set({ isLoading: true, error: null })
      try {
        const cart = await cartApi.get()
        if (startEpoch === epoch) set({ cart })
      } catch (error) {
        if (startEpoch === epoch) set({ error: toApiError(error).message })
      } finally {
        if (startEpoch === epoch) set({ isLoading: false })
      }
    },

    addVariant: (variantId, quantity = 1, selections = []) => mutate(() => cartApi.addVariant(variantId, quantity, selections)),
    addGiftBox: (giftBoxConfigId) => mutate(() => cartApi.addGiftBox(giftBoxConfigId)),
    setQuantity: (itemId, quantity) =>
      mutate(() => (quantity <= 0 ? cartApi.removeItem(itemId) : cartApi.setQuantity(itemId, quantity))),
    removeItem: (itemId) => mutate(() => cartApi.removeItem(itemId)),

    reset: () => {
      epoch += 1
      set({ cart: null, isLoading: false, error: null, pendingCount: 0 })
    },
  }
})

type CartSnapshot = Pick<CartState, 'cart'>

/** Tổng số món (cộng số lượng của mọi dòng, kể cả hộp quà tùy chỉnh). */
export const selectCartCount = ({ cart }: CartSnapshot): number =>
  cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

export const selectCartIsEmpty = ({ cart }: CartSnapshot): boolean => (cart?.items.length ?? 0) === 0

export const selectIsCartSyncing = ({ pendingCount }: Pick<CartState, 'pendingCount'>): boolean => pendingCount > 0
