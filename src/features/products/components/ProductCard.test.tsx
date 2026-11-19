import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { makeProduct, makeVariant } from '../testUtils'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

const product: Product = makeProduct({
  id: 'p1',
  name: 'Nến thơm Hoa Nhài',
  description: 'Lưu hương 40 giờ',
  price: 185000,
  stockQuantity: 3,
})

const renderCard = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ProductCard', () => {
  it('hiển thị tên, mô tả và giá', () => {
    renderCard(<ProductCard product={product} onQuickAdd={vi.fn()} />)
    expect(screen.getByText('Nến thơm Hoa Nhài')).toBeInTheDocument()
    expect(screen.getByText('Lưu hương 40 giờ')).toBeInTheDocument()
    expect(screen.getByText(/185\.000/)).toBeInTheDocument()
  })

  it('gọi onQuickAdd với đúng sản phẩm khi bấm nút thêm', async () => {
    const onQuickAdd = vi.fn()
    renderCard(<ProductCard product={product} onQuickAdd={onQuickAdd} />)
    await userEvent.click(screen.getByRole('button', { name: /Thêm Nến thơm Hoa Nhài/ }))
    expect(onQuickAdd).toHaveBeenCalledWith(product)
  })

  it('vô hiệu hoá nút thêm khi hết hàng hoặc ngừng bán', () => {
    renderCard(<ProductCard product={{ ...product, status: 'DISCONTINUED' }} onQuickAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Thêm/ })).toBeDisabled()
  })

  it('sản phẩm nhiều biến thể: hiện "Từ" giá thấp nhất và nút Chọn dẫn tới trang chi tiết', () => {
    const multi = makeProduct({
      id: 'p2', name: 'Sổ da',
      variants: [makeVariant({ id: 'a', productId: 'p2', sku: 'A', price: 120000 }), makeVariant({ id: 'b', productId: 'p2', sku: 'B', price: 150000 })],
    })
    renderCard(<ProductCard product={multi} onQuickAdd={vi.fn()} />)
    expect(screen.getByText('Từ')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chọn Sổ da' })).toHaveAttribute('href', '/products/p2')
    expect(screen.queryByRole('button', { name: /Thêm/ })).not.toBeInTheDocument()
  })

  it('vô hiệu hoá nút thêm và hiện nhãn khi hết hàng', () => {
    renderCard(<ProductCard product={makeProduct({ id: 'p1', name: 'Nến thơm Hoa Nhài', stockQuantity: 0 })} onQuickAdd={vi.fn()} />)
    expect(screen.getByText('Hết hàng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thêm/ })).toBeDisabled()
  })
})
