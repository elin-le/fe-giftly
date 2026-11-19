import { renderHook } from '@testing-library/react'
import { ApiError } from '@/api/errors'
import { useToastStore } from '@/stores/toastStore'
import { cartApi } from '../api/cartApi'
import { useCartStore } from '../cartStore'
import { makeCart } from '../testUtils'
import { useCartActions } from './useCartActions'

vi.mock('../api/cartApi', () => ({
  cartApi: { get: vi.fn(), addVariant: vi.fn(), addGiftBox: vi.fn(), setQuantity: vi.fn(), removeItem: vi.fn() },
}))

const toasts = () => useToastStore.getState().toasts

describe('useCartActions', () => {
  beforeEach(() => {
    Object.values(vi.mocked(cartApi)).forEach((fn) => fn.mockReset())
    useCartStore.getState().reset()
    useToastStore.setState({ toasts: [] })
  })

  it('thêm sản phẩm thành công: trả về true và báo đã thêm', async () => {
    vi.mocked(cartApi.addVariant).mockResolvedValue(makeCart())
    const { result } = renderHook(() => useCartActions())

    await expect(result.current.addVariant('v1', 'Nến thơm')).resolves.toBe(true)
    expect(toasts()[0]).toMatchObject({ tone: 'success', message: 'Đã thêm "Nến thơm" vào giỏ hàng' })
  })

  it('vượt tồn kho: trả về false và hiện đúng thông điệp của server', async () => {
    vi.mocked(cartApi.addVariant).mockRejectedValue(new ApiError('"Nến thơm" chỉ còn 2 sản phẩm', 409))
    const { result } = renderHook(() => useCartActions())

    await expect(result.current.addVariant('v1', 'Nến thơm')).resolves.toBe(false)
    expect(toasts()[0]).toMatchObject({ tone: 'error', message: '"Nến thơm" chỉ còn 2 sản phẩm' })
  })

  it('đổi số lượng thành công thì không làm phiền bằng thông báo', async () => {
    vi.mocked(cartApi.setQuantity).mockResolvedValue(makeCart())
    const { result } = renderHook(() => useCartActions())

    await expect(result.current.setQuantity('ci1', 2)).resolves.toBe(true)
    expect(toasts()).toHaveLength(0)
  })

  it('xoá dòng: báo đã xoá; lỗi mạng: báo lỗi', async () => {
    vi.mocked(cartApi.removeItem).mockResolvedValueOnce(makeCart()).mockRejectedValueOnce(new ApiError('Mất kết nối'))
    const { result } = renderHook(() => useCartActions())

    await result.current.removeItem('ci1')
    await result.current.removeItem('ci1')
    expect(toasts().map((toast) => toast.message)).toEqual(['Đã xoá khỏi giỏ hàng', 'Mất kết nối'])
  })
})
