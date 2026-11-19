import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { makeGiftBoxItem } from '../testUtils'
import { CartGiftBoxLine } from './CartGiftBoxLine'

const setup = (reviewStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED', reviewNote: string | null = null) => {
  const base = makeGiftBoxItem()
  render(
    <MemoryRouter>
      <CartGiftBoxLine item={{ ...base, giftBox: { ...base.giftBox, reviewStatus, reviewNote } }} onRemove={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('CartGiftBoxLine', () => {
  it('hộp vừa vặn: có nút chỉnh sửa, không có nhãn duyệt', () => {
    setup('NOT_REQUIRED')
    expect(screen.getByRole('link', { name: /Chỉnh sửa/ })).toHaveAttribute('href', '/builder?edit=gb1')
    expect(screen.queryByText('Chờ Giftly duyệt')).not.toBeInTheDocument()
  })

  it('chờ duyệt: hiện nhãn, lý do và vẫn sửa được', () => {
    setup('PENDING', 'Vượt sức chứa khoảng 17%')
    expect(screen.getByText('Chờ Giftly duyệt')).toBeInTheDocument()
    expect(screen.getByText('Vượt sức chứa khoảng 17%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Chỉnh sửa/ })).toBeInTheDocument()
  })

  it('đã duyệt thì khoá chỉnh sửa', () => {
    setup('APPROVED')
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Chỉnh sửa/ })).not.toBeInTheDocument()
  })
})
