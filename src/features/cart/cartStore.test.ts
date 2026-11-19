import { ApiError } from '@/api/errors'
import { cartApi } from './api/cartApi'
import { selectCartCount, selectCartIsEmpty, selectIsCartSyncing, useCartStore } from './cartStore'
import { makeCart, makeGiftBoxItem, makeVariantItem } from './testUtils'
import type { Cart } from './types'

vi.mock('./api/cartApi', () => ({
  cartApi: { get: vi.fn(), addVariant: vi.fn(), addGiftBox: vi.fn(), setQuantity: vi.fn(), removeItem: vi.fn() },
}))

const api = vi.mocked(cartApi)
const state = () => useCartStore.getState()

/** Promise có thể giải quyết thủ công, để kiểm tra thứ tự các request. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('cartStore', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset())
    state().reset()
  })

  describe('tải giỏ hàng', () => {
    it('lưu giỏ hàng từ server', async () => {
      const cart = makeCart([makeVariantItem()])
      api.get.mockResolvedValue(cart)
      await state().load()
      expect(state().cart).toEqual(cart)
      expect(state().isLoading).toBe(false)
      expect(state().error).toBeNull()
    })

    it('lỗi mạng: giữ thông báo lỗi tiếng Việt, không ném ra ngoài', async () => {
      api.get.mockRejectedValue(new ApiError('Không thể kết nối tới máy chủ.'))
      await expect(state().load()).resolves.toBeUndefined()
      expect(state().error).toBe('Không thể kết nối tới máy chủ.')
      expect(state().isLoading).toBe(false)
    })

    it('bỏ qua kết quả tải về sau khi đã đăng xuất (reset)', async () => {
      const pending = deferred<Cart>()
      api.get.mockReturnValue(pending.promise)
      const loading = state().load()
      state().reset()
      pending.resolve(makeCart([makeVariantItem()]))
      await loading
      expect(state().cart).toBeNull()
    })
  })

  describe('thao tác ghi', () => {
    it('thêm sản phẩm: giỏ hàng lấy theo phản hồi của server', async () => {
      const cart = makeCart([makeVariantItem({ quantity: 2, subtotal: 200000 })])
      api.addVariant.mockResolvedValue(cart)
      await state().addVariant('p1', 2)
      expect(api.addVariant).toHaveBeenCalledWith('p1', 2, [])
      expect(state().cart).toEqual(cart)
    })

    it('mặc định thêm 1 sản phẩm; thêm hộp quà gửi đúng configId', async () => {
      api.addVariant.mockResolvedValue(makeCart())
      api.addGiftBox.mockResolvedValue(makeCart([makeGiftBoxItem()]))
      await state().addVariant('p1')
      await state().addGiftBox('gb1')
      expect(api.addVariant).toHaveBeenCalledWith('p1', 1, [])
      expect(api.addGiftBox).toHaveBeenCalledWith('gb1')
    })

    it('đặt số lượng > 0 gọi PATCH, số lượng ≤ 0 xoá dòng', async () => {
      api.setQuantity.mockResolvedValue(makeCart())
      api.removeItem.mockResolvedValue(makeCart())
      await state().setQuantity('ci1', 3)
      await state().setQuantity('ci1', 0)
      await state().setQuantity('ci2', -1)
      expect(api.setQuantity).toHaveBeenCalledWith('ci1', 3)
      expect(api.removeItem).toHaveBeenCalledTimes(2)
    })

    it('lỗi từ server (vd. hết hàng): ném lỗi, giữ nguyên giỏ cũ và nhả cờ đang đồng bộ', async () => {
      const before = makeCart([makeVariantItem()])
      useCartStore.setState({ cart: before })
      api.addVariant.mockRejectedValue(new ApiError('"Nến" chỉ còn 2 sản phẩm', 409))

      await expect(state().addVariant('p1', 9)).rejects.toMatchObject({ status: 409 })
      expect(state().cart).toBe(before)
      expect(selectIsCartSyncing(state())).toBe(false)
    })

    it('các thao tác chạy tuần tự: request sau chỉ phát đi khi request trước đã xong', async () => {
      const first = deferred<Cart>()
      const second = deferred<Cart>()
      api.addVariant.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

      const a = state().addVariant('p1')
      const b = state().addVariant('p2')
      await Promise.resolve()
      expect(api.addVariant).toHaveBeenCalledTimes(1)
      expect(selectIsCartSyncing(state())).toBe(true)

      const cartA = makeCart([makeVariantItem({ id: 'A' })])
      const cartB = makeCart([makeVariantItem({ id: 'B' })])
      first.resolve(cartA)
      await a
      expect(api.addVariant).toHaveBeenCalledTimes(2)
      second.resolve(cartB)
      await b

      expect(state().cart).toBe(cartB)
      expect(selectIsCartSyncing(state())).toBe(false)
    })

    it('một thao tác lỗi không chặn các thao tác sau', async () => {
      api.addVariant.mockRejectedValueOnce(new ApiError('Lỗi', 500)).mockResolvedValueOnce(makeCart())
      const failed = state().addVariant('p1')
      const ok = state().addVariant('p2')
      await expect(failed).rejects.toBeInstanceOf(ApiError)
      await expect(ok).resolves.toBeUndefined()
    })

    it('đăng xuất giữa chừng: phản hồi muộn không ghi vào giỏ của phiên mới', async () => {
      const pending = deferred<Cart>()
      api.addVariant.mockReturnValue(pending.promise)
      const adding = state().addVariant('p1')
      state().reset()
      pending.resolve(makeCart([makeVariantItem()]))
      await adding
      expect(state().cart).toBeNull()
      expect(state().pendingCount).toBe(0)
    })
  })

  describe('selectors', () => {
    it('giỏ chưa tải hoặc không có dòng nào là rỗng, số lượng bằng 0', () => {
      expect(selectCartIsEmpty({ cart: null })).toBe(true)
      expect(selectCartIsEmpty({ cart: makeCart() })).toBe(true)
      expect(selectCartCount({ cart: null })).toBe(0)
    })

    it('đếm cả số lượng sản phẩm lẻ lẫn hộp quà tùy chỉnh', () => {
      const cart = makeCart([makeVariantItem({ quantity: 3, subtotal: 300000 }), makeGiftBoxItem()])
      expect(selectCartCount({ cart })).toBe(4)
      expect(selectCartIsEmpty({ cart })).toBe(false)
    })
  })

  it('reset đưa store về trạng thái ban đầu', () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()]), error: 'x', pendingCount: 2 })
    state().reset()
    expect(state()).toMatchObject({ cart: null, error: null, pendingCount: 0, isLoading: false })
  })
})
