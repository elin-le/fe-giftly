import { render, screen } from '@testing-library/react'
import { CartTotals } from './CartTotals'

describe('CartTotals', () => {
  it('hiển thị tạm tính, phí vận chuyển và tổng cộng', () => {
    render(<CartTotals subtotal={200000} shippingFee={30000} totalAmount={230000} />)
    expect(screen.getByText('Tạm tính').nextSibling).toHaveTextContent(/200\.000/)
    expect(screen.getByText('Phí vận chuyển').nextSibling).toHaveTextContent(/30\.000/)
    expect(screen.getByText('Tổng cộng').nextSibling).toHaveTextContent(/230\.000/)
  })

  it('phí vận chuyển 0 hiển thị "Miễn phí"', () => {
    render(<CartTotals subtotal={600000} shippingFee={0} totalAmount={600000} />)
    expect(screen.getByText('Miễn phí')).toBeInTheDocument()
  })
})
