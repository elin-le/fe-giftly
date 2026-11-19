import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { cartApi } from '@/features/cart/api/cartApi'
import { makeCart, makeGiftBoxItem } from '@/features/cart/testUtils'
import { productsApi } from '@/features/products/api/productsApi'
import { useAuthStore } from '@/stores/authStore'
import { giftBoxApi } from '../api/giftBoxApi'
import { useGiftBuilderStore } from '../giftBuilderStore'
import { makeVariant } from '@/features/products/testUtils'
import { CATEGORIES, makeAccessory, makeBox, makeCard, makeGift } from '../testUtils'
import { GiftBuilderPage } from './GiftBuilderPage'

vi.mock('@/features/products/api/productsApi', () => ({ productsApi: { list: vi.fn(), categories: vi.fn() } }))
vi.mock('../api/giftBoxApi', () => ({ giftBoxApi: { create: vi.fn() } }))
vi.mock('@/features/cart/api/cartApi', () => ({ cartApi: { addGiftBox: vi.fn() } }))

const bigBox = makeBox({
  id: 'b2', name: 'Hộp Lớn',
  variants: [makeVariant({ id: 'bv2', productId: 'b2', sku: 'BOX-L', price: 130000, stockQuantity: 10, giftBoxDetail: { inner: { length: 30, width: 30, height: 12, unit: 'CM' }, maxWeight: { value: 5, unit: 'KG' } } })],
})

const catalog = [
  makeBox({ id: 'b1', name: 'Hộp Nhỏ' }),
  bigBox,
  makeAccessory({ id: 'w1', name: 'Giấy kraft' }),
  makeCard({ id: 'k1', name: 'Thiệp viết tay' }),
  makeGift({ id: 'g1', name: 'Trà thảo mộc' }),
  makeGift({
    id: 'g2', name: 'Bánh quy bơ',
    variants: [makeVariant({ id: 'gv2', productId: 'g2', sku: 'COOKIE', price: 95000, stockQuantity: 1, dimensions: { length: 10, width: 10, height: 5, unit: 'CM' }, weight: { value: 100, unit: 'G' } })],
  }),
]

const view = makeGiftBoxItem().giftBox!
const user = { id: 'u1', email: 'an@example.com', fullName: 'An', phone: null, status: 'ACTIVE' as const, roles: ['ROLE_USER' as const] }

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/builder']}>
      <Routes>
        <Route path="/builder" element={<GiftBuilderPage />} />
        <Route path="/cart" element={<p>Trang giỏ hàng</p>} />
        <Route path="/signin" element={<p>Trang đăng nhập</p>} />
      </Routes>
    </MemoryRouter>,
  )

/** Chọn hộp nhỏ + 1 trà rồi tới bước hoàn tất. */
async function buildBoxAndReview(actor: ReturnType<typeof userEvent.setup>) {
  await actor.click(await screen.findByRole('radio', { name: /Hộp Nhỏ/ }))
  await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))
  await actor.click(await screen.findByRole('button', { name: 'Tăng Trà thảo mộc' }))
  await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))
  await actor.click(await screen.findByRole('button', { name: /Giấy kraft/ }))
  await actor.click(screen.getByRole('button', { name: /Thiệp viết tay/ }))
  await actor.type(screen.getByLabelText(/Lời chúc cho Thiệp viết tay/), '  Chúc mừng!  ')
  await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))
}

describe('GiftBuilderPage', () => {
  beforeEach(() => {
    vi.mocked(productsApi.list).mockResolvedValue(catalog)
    vi.mocked(productsApi.categories).mockResolvedValue(CATEGORIES)
    vi.mocked(giftBoxApi.create).mockReset().mockResolvedValue(view)
    vi.mocked(cartApi.addGiftBox).mockReset().mockResolvedValue(makeCart([makeGiftBoxItem()]))
    useGiftBuilderStore.getState().reset()
    useAuthStore.getState().signOut()
  })

  it('chỉ cho đi tiếp sau khi chọn hộp', async () => {
    const actor = userEvent.setup()
    renderPage()
    const next = await screen.findByRole('button', { name: /Tiếp tục/ })
    expect(next).toBeDisabled()
    await actor.click(screen.getByRole('radio', { name: /Hộp Nhỏ/ }))
    expect(next).toBeEnabled()
  })

  it('cần có món mới đi tiếp và không thêm quá tồn kho', async () => {
    const actor = userEvent.setup()
    renderPage()
    await actor.click(await screen.findByRole('radio', { name: /Hộp Nhỏ/ }))
    await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))

    await actor.click(await screen.findByRole('button', { name: 'Tăng Trà thảo mộc' }))
    await actor.click(screen.getByRole('button', { name: 'Giảm Trà thảo mộc' }))
    expect(screen.getByRole('button', { name: /Tiếp tục/ })).toBeDisabled()

    await actor.click(screen.getByRole('button', { name: 'Tăng Bánh quy bơ' }))
    expect(screen.getByRole('button', { name: 'Tăng Bánh quy bơ' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Tiếp tục/ })).toBeEnabled()
  })

  it('chưa đăng nhập: không thêm vào giỏ, chuyển tới đăng nhập và giữ nguyên bản nháp', async () => {
    const actor = userEvent.setup()
    renderPage()
    await buildBoxAndReview(actor)
    await actor.click(await screen.findByRole('button', { name: /Thêm vào giỏ hàng/ }))

    expect(await screen.findByText('Trang đăng nhập')).toBeInTheDocument()
    expect(giftBoxApi.create).not.toHaveBeenCalled()
    expect(cartApi.addGiftBox).not.toHaveBeenCalled()
    expect(useGiftBuilderStore.getState().draft.box?.variantId).toBe('bv1')
  })

  it('đã đăng nhập: lưu cấu hình, thêm vào giỏ, làm mới bản nháp và sang giỏ hàng', async () => {
    useAuthStore.getState().setSession({ token: 't', user })
    const actor = userEvent.setup()
    renderPage()
    await buildBoxAndReview(actor)
    await actor.click(await screen.findByRole('button', { name: /Thêm vào giỏ hàng/ }))

    expect(await screen.findByText('Trang giỏ hàng')).toBeInTheDocument()
    expect(giftBoxApi.create).toHaveBeenCalledWith({
      boxVariantId: 'bv1',
      items: [
        { productVariantId: 'gv1', quantity: 1 },
        { productVariantId: 'w1-v', quantity: 1 },
        { productVariantId: 'k1-v', quantity: 1, messageText: 'Chúc mừng!', messageRenderingMethod: 'HANDWRITTEN' },
      ],
    })
    expect(cartApi.addGiftBox).toHaveBeenCalledWith('gb1')
    expect(useGiftBuilderStore.getState().draft.box).toBeNull()
  })

  it('hiện lỗi từ server và giữ bản nháp để thử lại', async () => {
    useAuthStore.getState().setSession({ token: 't', user })
    vi.mocked(giftBoxApi.create).mockRejectedValue(new ApiError('"Trà thảo mộc" chỉ còn 0 sản phẩm', 409))
    const actor = userEvent.setup()
    renderPage()
    await buildBoxAndReview(actor)
    await actor.click(await screen.findByRole('button', { name: /Thêm vào giỏ hàng/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('chỉ còn 0 sản phẩm')
    expect(screen.getByRole('button', { name: /Thêm vào giỏ hàng/ })).toBeEnabled()
    expect(useGiftBuilderStore.getState().draft.box?.variantId).toBe('bv1')
  })

  it('phụ kiện hiện "Miễn phí", thiệp tính theo giá bán; chỉ hiện ô lời chúc khi chọn thiệp', async () => {
    const actor = userEvent.setup()
    renderPage()
    await actor.click(await screen.findByRole('radio', { name: /Hộp Nhỏ/ }))
    await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))
    await actor.click(await screen.findByRole('button', { name: 'Tăng Trà thảo mộc' }))
    await actor.click(screen.getByRole('button', { name: /Tiếp tục/ }))

    expect(await screen.findByRole('button', { name: /Giấy kraft.*Miễn phí/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thiệp viết tay.*45\.000/ })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Lời chúc cho/)).not.toBeInTheDocument()
    await actor.click(screen.getByRole('button', { name: /Thiệp viết tay/ }))
    expect(screen.getByLabelText(/Lời chúc cho Thiệp viết tay/)).toBeInTheDocument()
  })

  it('báo lỗi tải sản phẩm và cho phép thử lại', async () => {
    vi.mocked(productsApi.list).mockRejectedValueOnce(new Error('Mất kết nối')).mockResolvedValueOnce(catalog)
    const actor = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Mất kết nối')
    await actor.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('radio', { name: /Hộp Nhỏ/ })).toBeInTheDocument()
  })

  it('báo khi chưa có hộp quà nào', async () => {
    vi.mocked(productsApi.list).mockResolvedValue([makeGift()])
    renderPage()
    expect(await screen.findByText('Hiện chưa có hộp quà nào để thiết kế.')).toBeInTheDocument()
  })
})
