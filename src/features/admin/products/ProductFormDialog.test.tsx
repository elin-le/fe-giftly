import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createDb } from '@/api/mock/db'
import { resolveProducts } from '@/api/mock/catalogView'
import { PRODUCT_IDS } from '@/api/mock/data'
import type { Product, ProductInput } from '@/features/products/types'
import { uploadsApi } from '@/features/products/api/uploadsApi'
import { ProductFormDialog } from './ProductFormDialog'

vi.mock('@/features/products/api/uploadsApi', () => ({ uploadsApi: { image: vi.fn() } }))

const db = createDb()
const products = resolveProducts(db)
const categories = db.categories
const find = (id: string): Product => products.find((p) => p.id === id)!

function setup(product?: Product) {
  const onSubmit = vi.fn<(input: ProductInput) => void>()
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<ProductFormDialog open product={product} categories={categories} products={products} isSaving={false} onSubmit={onSubmit} onClose={onClose} />)
  return { user, onSubmit, onClose }
}

const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) => user.click(screen.getByRole('tab', { name }))

describe('ProductFormDialog', () => {
  it('sửa giá của biến thể và gửi payload đầy đủ giữ nguyên id, chính sách, tuỳ chọn', async () => {
    const candle = find(PRODUCT_IDS.candle)
    const { user, onSubmit } = setup(candle)

    await openTab(user, 'Biến thể')
    await user.click(screen.getAllByRole('button', { name: /CANDLE-100/ })[0]!)
    const price = screen.getAllByLabelText('Giá (₫)')[0]!
    await user.clear(price)
    await user.type(price, '199000')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const input = onSubmit.mock.calls[0]![0]
    expect(input.variants).toHaveLength(2)
    expect(input.variants[0]).toMatchObject({ id: candle.variants[0]!.id, price: 199000, optionValueIds: candle.variants[0]!.optionValueIds })
    expect(input.options).toHaveLength(1)
    expect(input.isCustomBoxEligible).toBe(true)
  })

  it('lỗi ở thẻ khác: chuyển tới thẻ có lỗi và không gửi', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Tên sản phẩm tối thiểu 2 ký tự')).toBeInTheDocument()
  })

  it('thêm tuỳ chọn Màu, gán cho biến thể và gửi optionValueIds', async () => {
    const { user, onSubmit } = setup()
    await user.type(screen.getByLabelText('Tên sản phẩm'), 'Gấu bông')
    await user.click(screen.getByRole('combobox', { name: 'Danh mục' }))
    await user.click(await screen.findByRole('option', { name: 'Quà tặng & phụ kiện' }))

    await openTab(user, 'Tuỳ chọn')
    await user.click(screen.getByRole('button', { name: 'Thêm tuỳ chọn' }))
    await user.type(screen.getByLabelText('Tên tuỳ chọn'), 'Màu')
    await user.type(screen.getByLabelText('Giá trị'), 'Hồng')

    await openTab(user, 'Biến thể')
    await user.type(screen.getByLabelText('SKU'), 'TED-PINK')
    await user.type(screen.getByLabelText('Giá (₫)'), '250000')
    await user.click(screen.getByRole('combobox', { name: 'Màu' }))
    await user.click(await screen.findByRole('option', { name: 'Hồng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    const input = onSubmit.mock.calls[0]![0]
    expect(input.options[0]).toMatchObject({ name: 'Màu', values: [{ value: 'Hồng', colorHex: null }] })
    expect(input.variants[0]!.optionValueIds).toEqual([input.options[0]!.values[0]!.id])
  })

  it('hàng dễ hỏng cần không đổi trả và cọc ≥ 50%: báo lỗi trong thẻ Biến thể', async () => {
    const { user, onSubmit } = setup(find(PRODUCT_IDS.tea))
    await openTab(user, 'Biến thể')
    await user.click(await screen.findByRole('switch', { name: 'Hàng dễ hỏng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(await screen.findByText('Hàng dễ hỏng phải không đổi trả')).toBeInTheDocument()
    expect(screen.getByText('Hàng dễ hỏng cần đặt cọc tối thiểu 50%')).toBeInTheDocument()
  })

  it('set quà: hiện thành phần và nhóm tuỳ chọn của biến thể; hộp quà hiện lòng hộp', async () => {
    const set = setup(find(PRODUCT_IDS.setBirthdaySage))
    await openTab(set.user, 'Biến thể')
    expect(screen.getByText('Thành phần cố định (đã gồm trong giá set)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Giấy gói')).toBeInTheDocument()
  })

  it('hộp quà hiện ô lòng hộp và tải trọng', async () => {
    const box = setup(find(PRODUCT_IDS.boxWood))
    await openTab(box.user, 'Biến thể')
    const section = screen.getByText(/Lòng hộp và tải trọng/).parentElement!
    expect(within(section).getByLabelText('Tải trọng tối đa')).toHaveValue(4)
  })

  it('ảnh: thêm ảnh và chọn ảnh đại diện', async () => {
    const { user, onSubmit } = setup(find(PRODUCT_IDS.tea))
    await openTab(user, 'Ảnh')
    await user.click(screen.getByRole('button', { name: 'Thêm ảnh' }))
    const urlInputs = screen.getAllByLabelText('Đường dẫn ảnh')
    await user.type(urlInputs[urlInputs.length - 1]!, 'https://cdn.example.com/tea.jpg')
    const radios = screen.getAllByRole('radio', { name: 'Ảnh đại diện' })
    await user.click(radios[radios.length - 1]!)
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit.mock.calls[0]![0].images).toContainEqual({ imageUrl: 'https://cdn.example.com/tea.jpg', isThumbnail: true, productVariantId: null })
  })

  it('đóng hộp thoại bằng nút Huỷ', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Huỷ' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('ảnh: tải từ thiết bị thêm một dòng ảnh; tệp sai loại bị báo lỗi và không gửi lên server', async () => {
    vi.mocked(uploadsApi.image).mockResolvedValue({ imageUrl: 'data:image/png;base64,AAA', secureUrl: 'data:image/png;base64,AAA', publicId: 'upload/1' })
    const { user, onSubmit } = setup(find(PRODUCT_IDS.tea))
    await openTab(user, 'Ảnh')
    const input = screen.getByLabelText('Chọn ảnh từ thiết bị')
    const rawUser = userEvent.setup({ applyAccept: false })
    await rawUser.upload(input, new File(['x'], 'doc.pdf', { type: 'application/pdf' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Chỉ nhận ảnh')
    expect(uploadsApi.image).not.toHaveBeenCalled()

    await user.upload(input, new File([new Uint8Array(4)], 'tea.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit.mock.calls[0]![0].images).toContainEqual(expect.objectContaining({ imageUrl: 'data:image/png;base64,AAA' }))
  })
})
