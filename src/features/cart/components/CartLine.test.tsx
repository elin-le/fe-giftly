import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { makeVariantItem } from '../testUtils'
import { CartLine } from './CartLine'

const setup = (imageUrl: string | null) =>
  render(
    <MemoryRouter>
      <CartLine item={makeVariantItem({ variant: { ...makeVariantItem().variant, imageUrl } })} onQuantityChange={vi.fn()} onRemove={vi.fn()} />
    </MemoryRouter>,
  )

describe('CartLine', () => {
  it('bấm tên hoặc ảnh sản phẩm sẽ mở trang chi tiết', () => {
    setup(null)
    for (const link of screen.getAllByRole('link')) expect(link).toHaveAttribute('href', '/products/p1')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('có hình mặc định khi chưa có ảnh, dùng ảnh thật khi có', () => {
    const { unmount } = setup(null)
    expect(screen.getByRole('img', { name: 'Nến thơm Hoa Nhài' }).tagName).toBe('DIV')
    unmount()
    setup('https://cdn.example.com/a.jpg')
    expect(screen.getByRole('img', { name: 'Nến thơm Hoa Nhài' })).toHaveAttribute('src', 'https://cdn.example.com/a.jpg')
  })
})
