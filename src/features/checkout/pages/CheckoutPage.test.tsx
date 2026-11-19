import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { addressesApi } from '@/features/addresses/api/addressesApi'
import type { Address } from '@/features/addresses/types'
import { useCartStore } from '@/features/cart/cartStore'
import { cartApi } from '@/features/cart/api/cartApi'
import { makeCart, makeGiftBoxItem, makeVariantItem } from '@/features/cart/testUtils'
import { ordersApi } from '@/features/orders/api/ordersApi'
import type { Order } from '@/features/orders/types'
import { CheckoutPage } from './CheckoutPage'

vi.mock('@/features/addresses/api/addressesApi', () => ({ addressesApi: { list: vi.fn(), create: vi.fn() } }))
vi.mock('@/features/orders/api/ordersApi', () => ({ ordersApi: { create: vi.fn() } }))
vi.mock('@/features/cart/api/cartApi', () => ({ cartApi: { get: vi.fn() } }))

const home: Address = { id: 'a1', recipientName: 'Nguyễn An', phone: '0901234567', addressLine: '12 Lê Lợi', ward: null, district: 'Quận 1', city: 'TP.HCM', isDefault: true }
const office: Address = { ...home, id: 'a2', recipientName: 'An (văn phòng)', addressLine: '45 Nguyễn Huệ', isDefault: false }

const placed = { id: 'o1', orderNumber: 'GFT-0007' } as Order
const perishable = makeVariantItem({
  id: 'ci9', quantity: 2, unitPrice: 95000, subtotal: 190000, returnPolicy: 'NO_RETURN', advancePaymentPercent: 50, advanceAmount: 95000,
  variant: { id: 'v9', productId: 'p9', productName: 'Bánh quy bơ', sku: 'COOKIE', optionLabel: null, imageUrl: null, stockQuantity: 10, isGiftSet: false, productType: 'REGULAR' },
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>,
  )

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.mocked(addressesApi.list).mockReset().mockResolvedValue([office, home])
    vi.mocked(addressesApi.create).mockReset()
    vi.mocked(ordersApi.create).mockReset().mockResolvedValue(placed)
    vi.mocked(cartApi.get).mockReset().mockResolvedValue(makeCart())
    useCartStore.getState().reset()
    useCartStore.setState({ cart: makeCart([makeVariantItem(), makeGiftBoxItem()]) })
  })

  it('hiển thị đơn hàng (kể cả hộp tùy chỉnh), phí ship và chọn sẵn địa chỉ mặc định', async () => {
    renderPage()
    expect(await screen.findByRole('radio', { name: /Nguyễn An/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /văn phòng/ })).not.toBeChecked()
    expect(screen.getByText('Nến thơm Hoa Nhài')).toBeInTheDocument()
    expect(screen.getByText(/Hộp quà tùy chỉnh · Hộp Giftly/)).toBeInTheDocument()
    expect(screen.getByText('Phí vận chuyển').nextElementSibling).toHaveTextContent('30.000')
  })

  it('xác nhận rồi gửi đơn với địa chỉ + phương thức đã chọn, sau đó hiện mã đơn', async () => {
    const actor = userEvent.setup()
    renderPage()
    await actor.click(await screen.findByRole('radio', { name: /văn phòng/ }))
    await actor.click(screen.getByRole('radio', { name: /Chuyển khoản/ }))
    await actor.click(screen.getByRole('button', { name: 'Xem lại đơn hàng' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/45 Nguyễn Huệ/)).toBeInTheDocument()
    await actor.click(within(dialog).getByRole('button', { name: 'Xác nhận đặt hàng' }))

    expect(await screen.findByText('GFT-0007')).toBeInTheDocument()
    expect(ordersApi.create).toHaveBeenCalledWith({ addressId: 'a2', paymentMethod: 'BANK_TRANSFER' })
    expect(cartApi.get).toHaveBeenCalled()
  })

  it('lỗi từ server (hết hàng) hiện trong hộp thoại và cho đặt lại', async () => {
    vi.mocked(ordersApi.create).mockRejectedValueOnce(new ApiError('"Bút khắc tên" chỉ còn 1 sản phẩm', 409))
    const actor = userEvent.setup()
    renderPage()
    await actor.click(await screen.findByRole('button', { name: 'Xem lại đơn hàng' }))
    await actor.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xác nhận đặt hàng' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('chỉ còn 1 sản phẩm')
    expect(screen.getByRole('button', { name: 'Xác nhận đặt hàng' })).toBeEnabled()
  })

  it('chưa có địa chỉ: hiện form thêm địa chỉ, lưu xong thì chọn địa chỉ mới', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([])
    vi.mocked(addressesApi.create).mockResolvedValue({ ...home, id: 'new1', isDefault: true })
    const actor = userEvent.setup()
    renderPage()

    const form = await screen.findByRole('form', { name: 'Thêm địa chỉ mới' })
    expect(screen.getByRole('button', { name: 'Xem lại đơn hàng' })).toBeDisabled()

    await actor.click(within(form).getByRole('button', { name: 'Lưu địa chỉ' }))
    expect(await within(form).findByText('Vui lòng nhập tên người nhận')).toBeInTheDocument()
    expect(addressesApi.create).not.toHaveBeenCalled()

    await actor.type(within(form).getByLabelText('Người nhận'), 'Nguyễn An')
    await actor.type(within(form).getByLabelText('Số điện thoại'), '0901234567')
    await actor.type(within(form).getByLabelText('Số nhà, tên đường'), '12 Lê Lợi')
    await actor.click(within(form).getByRole('button', { name: 'Lưu địa chỉ' }))

    expect(await screen.findByRole('radio', { name: /Nguyễn An/ })).toBeChecked()
    expect(addressesApi.create).toHaveBeenCalledWith(expect.objectContaining({ addressLine: '12 Lê Lợi', ward: null, isDefault: true }))
    expect(screen.getByRole('button', { name: 'Xem lại đơn hàng' })).toBeEnabled()
  })

  it('có khoản đặt cọc: nêu số tiền cọc, không đổi trả, khoá COD và tự chuyển sang chuyển khoản', async () => {
    useCartStore.setState({ cart: makeCart([perishable]) })
    const actor = userEvent.setup()
    renderPage()
    expect(await screen.findByText(/Không đổi trả/)).toBeInTheDocument()
    expect(screen.getByText(/Đặt cọc 50%/)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Thanh toán khi nhận hàng/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Chuyển khoản/ })).toBeChecked()

    await actor.click(screen.getByRole('button', { name: 'Xem lại đơn hàng' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Đặt cọc ngay')).toBeInTheDocument()
    expect(within(dialog).getByText('Thanh toán phần còn lại')).toBeInTheDocument()
    await actor.click(within(dialog).getByRole('button', { name: 'Xác nhận đặt hàng' }))
    expect(ordersApi.create).toHaveBeenCalledWith({ addressId: 'a1', paymentMethod: 'BANK_TRANSFER' })
  })

  it('giỏ trống: báo chưa có sản phẩm để thanh toán', async () => {
    useCartStore.setState({ cart: makeCart() })
    renderPage()
    expect(await screen.findByText('Chưa có sản phẩm để thanh toán')).toBeInTheDocument()
  })

  it('báo lỗi tải địa chỉ và cho thử lại', async () => {
    vi.mocked(addressesApi.list).mockRejectedValueOnce(new Error('Mất kết nối')).mockResolvedValueOnce([home])
    const actor = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Mất kết nối')
    await actor.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('radio', { name: /Nguyễn An/ })).toBeChecked()
  })
})
