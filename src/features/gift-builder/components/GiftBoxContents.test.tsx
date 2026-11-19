import { render, screen } from '@testing-library/react'
import { GiftBoxContents, type ContentLine } from './GiftBoxContents'

const line = (overrides: Partial<ContentLine> = {}): ContentLine => ({ id: '1', role: 'BOX', name: 'Hộp Nhỏ', quantity: 1, ...overrides })

describe('GiftBoxContents', () => {
  it('hiển thị vai trò, tên và số lượng (chỉ khi > 1)', () => {
    render(<GiftBoxContents lines={[line(), line({ id: '2', role: 'PRODUCT', name: 'Trà thảo mộc', quantity: 2 })]} />)
    expect(screen.getByText('Hộp:')).toBeInTheDocument()
    expect(screen.getByText(/Hộp Nhỏ/)).toBeInTheDocument()
    expect(screen.getByText('× 2')).toBeInTheDocument()
    expect(screen.queryByText('× 1')).not.toBeInTheDocument()
  })

  it('đánh dấu miễn phí cho phụ kiện/thiệp nhưng không cho hộp', () => {
    render(<GiftBoxContents lines={[line({ isComplimentary: true }), line({ id: '2', role: 'ACCESSORY', name: 'Giấy kraft', isComplimentary: true })]} />)
    expect(screen.getAllByText(/miễn phí/)).toHaveLength(1)
  })

  it('hiển thị lời chúc kèm cách thể hiện; bỏ qua khi rỗng hoặc null', () => {
    const card = line({ role: 'GREETING_CARD', name: 'Thiệp', messageText: 'Chúc mừng!', messageRenderingMethod: 'HANDWRITTEN' })
    const { rerender } = render(<GiftBoxContents lines={[card]} />)
    expect(screen.getByText(/“Chúc mừng!”/)).toBeInTheDocument()
    expect(screen.getByText('(Viết tay)')).toBeInTheDocument()

    rerender(<GiftBoxContents lines={[{ ...card, messageText: null }]} />)
    expect(screen.queryByText(/“/)).not.toBeInTheDocument()
    rerender(<GiftBoxContents lines={[{ ...card, messageText: '' }]} />)
    expect(screen.queryByText(/“/)).not.toBeInTheDocument()
  })

  it('hiển thị nút hành động cuối dòng', () => {
    render(<GiftBoxContents lines={[line({ action: <button>Đánh giá</button> })]} />)
    expect(screen.getByRole('button', { name: 'Đánh giá' })).toBeInTheDocument()
  })
})
