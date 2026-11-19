import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { useToastStore } from '@/stores/toastStore'
import { cartApi } from '../api/cartApi'
import { useCartStore } from '../cartStore'
import { makeCart, makeGiftBoxItem, makeVariantItem } from '../testUtils'
import { CartPage } from './CartPage'

vi.mock('../api/cartApi', () => ({
  cartApi: { get: vi.fn(), addVariant: vi.fn(), addGiftBox: vi.fn(), setQuantity: vi.fn(), removeItem: vi.fn() },
}))

const api = vi.mocked(cartApi)

const renderPage = () =>
  render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  )

describe('CartPage', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset())
    useCartStore.getState().reset()
    useToastStore.setState({ toasts: [] })
  })

  it('đang tải: hiện khung chờ', () => {
    useCartStore.setState({ cart: null, isLoading: true })
    renderPage()
    expect(screen.getByLabelText('Đang tải giỏ hàng')).toHaveAttribute('aria-busy', 'true')
  })

  it('tải lỗi: báo lỗi và cho thử lại', async () => {
    api.get.mockResolvedValue(makeCart([makeVariantItem()]))
    useCartStore.setState({ cart: null, error: 'Không thể kết nối tới máy chủ.' })
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Không thể kết nối tới máy chủ.')
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { name: 'Giỏ hàng' })).toBeInTheDocument()
  })

  it('giỏ trống: gợi ý đi mua hoặc tự thiết kế hộp quà', () => {
    useCartStore.setState({ cart: makeCart() })
    renderPage()
    expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem cửa hàng' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'Tự thiết kế hộp quà' })).toHaveAttribute('href', '/builder')
  })

  it('hiển thị sản phẩm, hộp quà tùy chỉnh, phí ship và tổng cộng', () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem({ quantity: 2, subtotal: 200000 }), makeGiftBoxItem()]) })
    renderPage()

    expect(screen.getByText('Nến thơm Hoa Nhài')).toBeInTheDocument()
    expect(screen.getByText('Hộp quà tùy chỉnh')).toBeInTheDocument()
    expect(screen.getByText('“Chúc mừng sinh nhật”')).toBeInTheDocument()
    expect(screen.getByText('Phí vận chuyển').nextElementSibling).toHaveTextContent('30.000')
    expect(screen.getByText(/460\.000/)).toBeInTheDocument() // 200.000 + 230.000 + 30.000
    expect(screen.getByRole('link', { name: 'Tiến hành đặt hàng' })).toHaveAttribute('href', '/checkout')
  })

  it('hiển thị "Miễn phí" khi phí vận chuyển bằng 0', () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()], { shippingFee: 0, totalAmount: 100000 }) })
    renderPage()
    expect(screen.getByText('Miễn phí')).toBeInTheDocument()
  })

  it('tăng số lượng: gọi server với đúng dòng và cập nhật theo phản hồi', async () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()]) })
    api.setQuantity.mockResolvedValue(makeCart([makeVariantItem({ quantity: 2, subtotal: 200000 })]))
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng Nến thơm Hoa Nhài' }))
    expect(api.setQuantity).toHaveBeenCalledWith('ci1', 2)
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
  })

  it('giảm số lượng từ 1 sẽ xoá dòng khỏi giỏ', async () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()]) })
    api.removeItem.mockResolvedValue(makeCart())
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Giảm số lượng Nến thơm Hoa Nhài' }))
    expect(api.removeItem).toHaveBeenCalledWith('ci1')
    expect(await screen.findByText('Giỏ hàng đang trống')).toBeInTheDocument()
  })

  it('xoá hộp quà tùy chỉnh', async () => {
    useCartStore.setState({ cart: makeCart([makeGiftBoxItem()]) })
    api.removeItem.mockResolvedValue(makeCart())
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Xoá hộp quà tùy chỉnh khỏi giỏ' }))
    expect(api.removeItem).toHaveBeenCalledWith('ci2')
    expect(await screen.findByText('Giỏ hàng đang trống')).toBeInTheDocument()
  })

  it('server từ chối (hết hàng): giữ nguyên giỏ và báo lỗi', async () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()]) })
    api.setQuantity.mockRejectedValue(new ApiError('"Nến thơm Hoa Nhài" chỉ còn 1 sản phẩm', 409))
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng Nến thơm Hoa Nhài' }))
    await waitFor(() => expect(useToastStore.getState().toasts).toHaveLength(1))
    expect(useToastStore.getState().toasts[0]).toMatchObject({ tone: 'error', message: expect.stringContaining('chỉ còn 1') })
    expect(useCartStore.getState().cart?.items[0]?.quantity).toBe(1)
  })

  it('khoá các nút khi đang đồng bộ để không gửi chồng thao tác', () => {
    useCartStore.setState({ cart: makeCart([makeVariantItem()]), pendingCount: 1 })
    renderPage()
    const line = screen.getByText('Nến thơm Hoa Nhài').closest('li') as HTMLElement
    within(line)
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled())
  })

  it('không cho tăng quá tồn kho', () => {
    useCartStore.setState({
      cart: makeCart([makeVariantItem({ variant: { ...makeVariantItem().variant, productName: 'Nến', stockQuantity: 1 } })]),
    })
    renderPage()
    expect(screen.getByRole('button', { name: 'Tăng số lượng Nến' })).toBeDisabled()
  })
})
