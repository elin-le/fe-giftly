import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ordersApi } from '../api/ordersApi'
import { reviewsApi } from '../api/reviewsApi'
import type { Order, OrderItem, OrderItemComponent, Review } from '../types'
import { OrdersPage } from './OrdersPage'

vi.mock('../api/ordersApi', () => ({ ordersApi: { listMine: vi.fn() } }))
vi.mock('../api/reviewsApi', () => ({ reviewsApi: { mine: vi.fn(), create: vi.fn() } }))

const listMine = vi.mocked(ordersApi.listMine)
const address = { id: 'a1', recipientName: 'An', phone: '0901234567', addressLine: '1 Lê Lợi', ward: null, district: null, city: null, isDefault: true }

const policyDefaults = { returnPolicySnapshot: 'RETURNABLE', advancePaymentPercentSnapshot: null, isPerishableSnapshot: false, shelfLifeHoursSnapshot: null } as const

const candle: OrderItem = {
  id: 'i1', productVariantId: 'v1', productId: 'p1', giftBoxConfigId: null, itemNameSnapshot: 'Nến thơm', skuSnapshot: 'CANDLE-200',
  variantSnapshot: { 'Dung tích': '200g' }, unitPrice: 170000, quantity: 2, subtotal: 340000, requiredAdvanceAmount: null, components: [], ...policyDefaults,
}

const component = (overrides: Partial<OrderItemComponent>): OrderItemComponent => ({
  id: 'c1', productVariantId: 'bv1', productId: 'b1', componentRole: 'BOX', productNameSnapshot: 'Hộp Giftly', skuSnapshot: 'BOX-S',
  variantSnapshot: { 'Cỡ hộp': 'S' }, quantity: 1, unitPrice: 60000, isComplimentary: false, messageText: null, messageRenderingMethod: null, ...policyDefaults, ...overrides,
})

const customBox: OrderItem = {
  id: 'i2', productVariantId: null, productId: null, giftBoxConfigId: 'gb1', itemNameSnapshot: 'Hộp quà tùy chỉnh', skuSnapshot: null, variantSnapshot: null,
  unitPrice: 230000, quantity: 1, subtotal: 230000, requiredAdvanceAmount: null, ...policyDefaults,
  components: [
    component({}),
    component({ id: 'c2', componentRole: 'PRODUCT', productId: 'g1', productNameSnapshot: 'Trà thảo mộc', variantSnapshot: null, quantity: 2, unitPrice: 85000 }),
    component({ id: 'c3', componentRole: 'ACCESSORY', productId: 'w1', productNameSnapshot: 'Giấy kraft', variantSnapshot: null, unitPrice: 0, isComplimentary: true }),
    component({ id: 'c4', componentRole: 'GREETING_CARD', productId: 'k1', productNameSnapshot: 'Thiệp', variantSnapshot: null, unitPrice: 0, isComplimentary: true, messageText: 'Chúc mừng sinh nhật', messageRenderingMethod: 'HANDWRITTEN' }),
  ],
}

const order: Order = {
  id: 'o1', userId: 'u1', customer: { id: 'u1', fullName: 'An', email: 'an@example.com' }, address, orderNumber: 'GFT-0001',
  subtotal: 340000, shippingFee: 30000, totalAmount: 370000, requiredAdvanceAmount: null, status: 'SHIPPING', orderedAt: '2026-11-01T08:00:00.000Z',
  items: [candle],
  payments: [{ id: 'pay1', paymentMethod: 'COD', paymentStatus: 'PENDING', paymentStage: 'FULL_PAYMENT', amount: 370000, paidAt: null }],
}

const review: Review = {
  id: 'r1', userId: 'u1', userName: 'An', productId: 'p1', productVariantId: 'v1', orderItemId: 'i1', orderItemComponentId: null,
  rating: 5, title: null, comment: null, createdAt: '2026-11-05T08:00:00.000Z',
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <OrdersPage />
    </MemoryRouter>,
  )

describe('OrdersPage', () => {
  beforeEach(() => {
    listMine.mockReset()
    vi.mocked(reviewsApi.mine).mockReset().mockResolvedValue([])
    vi.mocked(reviewsApi.create).mockReset()
  })

  it('hiển thị mã đơn, trạng thái, tên + biến thể (snapshot) và tổng tiền', async () => {
    listMine.mockResolvedValue([order])
    renderPage()
    expect(await screen.findByText('GFT-0001')).toBeInTheDocument()
    expect(screen.getByText('Đang vận chuyển')).toBeInTheDocument()
    expect(screen.getByText(/Nến thơm/)).toBeInTheDocument()
    expect(screen.getByText('(200g)')).toBeInTheDocument()
    expect(screen.getByText(/Thanh toán toàn bộ · Thanh toán khi nhận hàng/)).toBeInTheDocument()
    expect(screen.getAllByText(/370\.000/).length).toBeGreaterThan(0)
  })

  it('hộp tùy chỉnh: thành phần theo vai trò, phụ kiện miễn phí và lời chúc kèm cách thể hiện', async () => {
    listMine.mockResolvedValue([{ ...order, items: [customBox] }])
    renderPage()
    expect(await screen.findByText('Hộp quà tùy chỉnh')).toBeInTheDocument()
    expect(screen.getByText(/Hộp Giftly/)).toBeInTheDocument()
    expect(screen.getByText(/Trà thảo mộc/)).toBeInTheDocument()
    expect(screen.getAllByText(/miễn phí/)).toHaveLength(2) // giấy kraft + thiệp
    expect(screen.getByText(/Chúc mừng sinh nhật/)).toBeInTheDocument()
    expect(screen.getByText('(Viết tay)')).toBeInTheDocument()
  })

  it('đơn hàng dễ hỏng: hiện không đổi trả, đặt cọc và hai giai đoạn thanh toán', async () => {
    const perishable: OrderItem = {
      ...candle, itemNameSnapshot: 'Bánh quy bơ', variantSnapshot: null, returnPolicySnapshot: 'NO_RETURN',
      advancePaymentPercentSnapshot: 50, requiredAdvanceAmount: 95000, isPerishableSnapshot: true, shelfLifeHoursSnapshot: 336,
    }
    listMine.mockResolvedValue([{
      ...order, requiredAdvanceAmount: 95000, items: [perishable],
      payments: [
        { id: 'p1', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', paymentStage: 'ADVANCE_PAYMENT', amount: 95000, paidAt: '2026-11-01T09:00:00.000Z' },
        { id: 'p2', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PENDING', paymentStage: 'REMAINING_PAYMENT', amount: 275000, paidAt: null },
      ],
    }])
    renderPage()
    expect(await screen.findByText('Không đổi trả')).toBeInTheDocument()
    expect(screen.getByText(/Đặt cọc 50%/)).toBeInTheDocument()
    expect(screen.getByText(/dùng trong 336 giờ/)).toBeInTheDocument()
    const payments = screen.getByRole('list', { name: 'Thanh toán' })
    expect(within(payments).getByText(/Đặt cọc · Chuyển khoản/)).toBeInTheDocument()
    expect(within(payments).getByText(/Thanh toán phần còn lại/)).toBeInTheDocument()
  })

  it('chỉ đơn đã giao/hoàn thành mới có nút Đánh giá; dòng đã đánh giá hiện nhãn thay nút', async () => {
    listMine.mockResolvedValueOnce([order])
    const { unmount } = renderPage()
    await screen.findByText('GFT-0001')
    expect(screen.queryByRole('button', { name: /Đánh giá/ })).not.toBeInTheDocument()
    unmount()

    listMine.mockResolvedValue([{ ...order, status: 'COMPLETED' }])
    vi.mocked(reviewsApi.mine).mockResolvedValue([review])
    renderPage()
    expect(await screen.findByText('Đã đánh giá')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Đánh giá/ })).not.toBeInTheDocument()
  })

  it('đánh giá dòng đơn: chọn sao, gửi và đổi sang "Đã đánh giá"', async () => {
    listMine.mockResolvedValue([{ ...order, status: 'COMPLETED' }])
    vi.mocked(reviewsApi.create).mockResolvedValue(review)
    const actor = userEvent.setup()
    renderPage()
    await actor.click(await screen.findByRole('button', { name: 'Đánh giá Nến thơm' }))

    const dialog = await screen.findByRole('dialog')
    const submit = within(dialog).getByRole('button', { name: 'Gửi đánh giá' })
    expect(submit).toBeDisabled()
    await actor.click(within(dialog).getByRole('radio', { name: '5 sao' }))
    await actor.type(within(dialog).getByLabelText('Nhận xét'), '  Rất thơm  ')
    await actor.click(submit)

    expect(reviewsApi.create).toHaveBeenCalledWith({ orderItemId: 'i1', rating: 5, comment: 'Rất thơm', title: undefined })
    expect(await screen.findByText('Đã đánh giá')).toBeInTheDocument()
  })

  it('đánh giá thành phần trong hộp (chỉ món quà) và hiện lỗi từ server', async () => {
    listMine.mockResolvedValue([{ ...order, status: 'DELIVERED', items: [customBox] }])
    vi.mocked(reviewsApi.create).mockRejectedValue(new Error('Bạn đã đánh giá mục này rồi'))
    const actor = userEvent.setup()
    renderPage()
    expect(await screen.findAllByRole('button', { name: /Đánh giá/ })).toHaveLength(1)
    await actor.click(screen.getByRole('button', { name: /Đánh giá Trà thảo mộc/ }))
    const dialog = await screen.findByRole('dialog')
    await actor.click(within(dialog).getByRole('radio', { name: '4 sao' }))
    await actor.click(within(dialog).getByRole('button', { name: 'Gửi đánh giá' }))

    expect(reviewsApi.create).toHaveBeenCalledWith(expect.objectContaining({ orderItemComponentId: 'c2', rating: 4 }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('đã đánh giá')
    expect(within(dialog).getByRole('button', { name: 'Gửi đánh giá' })).toBeEnabled()
  })

  it('hiển thị trạng thái rỗng kèm liên kết tới cửa hàng', async () => {
    listMine.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Bạn chưa có đơn hàng nào.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chọn quà ngay' })).toHaveAttribute('href', '/products')
  })

  it('báo lỗi và cho phép thử lại', async () => {
    listMine.mockRejectedValueOnce(new Error('Mất kết nối')).mockResolvedValueOnce([order])
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Mất kết nối')
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('GFT-0001')).toBeInTheDocument()
  })
})
