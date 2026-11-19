import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupMock, signInAs } from '@/api/mock/testUtils'
import { AdminProductsPage } from './AdminProductsPage'

describe('AdminProductsPage (cha–biến thể)', () => {
  beforeEach(async () => {
    setupMock()
    await signInAs('admin')
  })

  it('ban đầu chỉ hiện sản phẩm cha; bấm vào mới hiện các biến thể với đủ thuộc tính', async () => {
    const user = userEvent.setup()
    render(<AdminProductsPage />)
    await user.type(await screen.findByLabelText('Tìm tên, SKU, thuộc tính'), 'nen thom')
    const candleRow = await screen.findByRole('row', { name: /Nến thơm Hoa Nhài/ })
    expect(screen.queryByText('CANDLE-100')).not.toBeInTheDocument()

    await user.click(candleRow)
    const variants = await screen.findByRole('table', { name: 'Biến thể của Nến thơm Hoa Nhài' })
    expect(within(variants).getByText('CANDLE-100')).toBeInTheDocument()
    expect(within(variants).getByText('CANDLE-200')).toBeInTheDocument()
    expect(within(variants).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(
      expect.arrayContaining(['SKU', 'Thuộc tính', 'Giá', 'Tồn kho', 'Kích thước', 'Khối lượng', 'Chính sách', 'Trạng thái']),
    )
  })

  it('tìm theo SKU của biến thể và lọc ra đúng sản phẩm cha', async () => {
    const user = userEvent.setup()
    render(<AdminProductsPage />)
    await user.type(await screen.findByLabelText('Tìm tên, SKU, thuộc tính'), 'candle-200')
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(3))
    expect(screen.getByRole('row', { name: /Nến thơm Hoa Nhài/ })).toBeInTheDocument()
  })

  it('nút "Chỉnh sửa biến thể" mở trình sửa ở thẻ Biến thể', async () => {
    const user = userEvent.setup()
    render(<AdminProductsPage />)
    await user.type(await screen.findByLabelText('Tìm tên, SKU, thuộc tính'), 'nen thom')
    await user.click(await screen.findByRole('row', { name: /Nến thơm Hoa Nhài/ }))
    await user.click(await screen.findByText('Chỉnh sửa biến thể'))
    expect(await screen.findByRole('tab', { name: /Biến thể/, selected: true })).toBeInTheDocument()
  })
})
