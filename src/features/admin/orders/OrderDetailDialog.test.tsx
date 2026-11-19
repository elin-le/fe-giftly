import { render, screen } from '@testing-library/react'
import type { Order } from '@/features/orders/types'
import { OrderDetailDialog } from './OrderDetailDialog'

const order: Order = {
  id: 'o1',
  userId: 'u1',
  customer: { id: 'u1', fullName: 'An', email: 'an@example.com' },
  address: { id: 'a1', recipientName: 'Nguyễn An', phone: '0901234567', addressLine: '12 Lê Lợi', ward: null, district: 'Quận 1', city: null, isDefault: true },
  orderNumber: 'GFT-0009',
  subtotal: 230000,
  shippingFee: 30000,
  totalAmount: 260000,
  status: 'PENDING_CONFIRMATION',
  orderedAt: '2026-11-01T08:00:00.000Z',
  requiredAdvanceAmount: 130000,
  items: [
    {
      id: 'i1', productVariantId: null, productId: null, giftBoxConfigId: 'gb1', itemNameSnapshot: 'Hộp quà tùy chỉnh', skuSnapshot: null, variantSnapshot: null,
      unitPrice: 230000, quantity: 1, subtotal: 230000, returnPolicySnapshot: 'NO_RETURN', advancePaymentPercentSnapshot: 50,
      isPerishableSnapshot: true, shelfLifeHoursSnapshot: 72, requiredAdvanceAmount: 115000,
      components: [
        { id: 'c1', productVariantId: 'bv1', productId: 'b1', componentRole: 'BOX', productNameSnapshot: 'Hộp Giftly', skuSnapshot: 'BOX-S', variantSnapshot: { 'Cỡ hộp': 'S' }, quantity: 1, unitPrice: 60000, isComplimentary: false, messageText: null, messageRenderingMethod: null, returnPolicySnapshot: 'RETURNABLE', advancePaymentPercentSnapshot: null, isPerishableSnapshot: false, shelfLifeHoursSnapshot: null },
        { id: 'c2', productVariantId: 'gv1', productId: 'g1', componentRole: 'PRODUCT', productNameSnapshot: 'Trà thảo mộc', skuSnapshot: 'TEA', variantSnapshot: null, quantity: 2, unitPrice: 85000, isComplimentary: false, messageText: null, messageRenderingMethod: null, returnPolicySnapshot: 'NO_RETURN', advancePaymentPercentSnapshot: 50, isPerishableSnapshot: true, shelfLifeHoursSnapshot: 72 },
        { id: 'c3', productVariantId: 'kv1', productId: 'k1', componentRole: 'GREETING_CARD', productNameSnapshot: 'Thiệp viết tay', skuSnapshot: 'CARD', variantSnapshot: null, quantity: 1, unitPrice: 0, isComplimentary: true, messageText: 'Chúc mừng!', messageRenderingMethod: 'PRINTED', returnPolicySnapshot: 'RETURNABLE', advancePaymentPercentSnapshot: null, isPerishableSnapshot: false, shelfLifeHoursSnapshot: null },
      ],
    },
  ],
  payments: [
    { id: 'p1', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', paymentStage: 'ADVANCE_PAYMENT', amount: 130000, paidAt: '2026-11-01T08:05:00.000Z' },
    { id: 'p2', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PENDING', paymentStage: 'REMAINING_PAYMENT', amount: 130000, paidAt: null },
  ],
}

describe('OrderDetailDialog', () => {
  it('hiển thị người nhận, địa chỉ, thành phần hộp, lời chúc, phí ship và tổng', () => {
    render(<OrderDetailDialog order={order} onClose={vi.fn()} />)
    expect(screen.getByText('Đơn hàng GFT-0009')).toBeInTheDocument()
    expect(screen.getByText(/Nguyễn An · 0901234567/)).toBeInTheDocument()
    expect(screen.getByText('12 Lê Lợi, Quận 1')).toBeInTheDocument()
    expect(screen.getByText(/Món quà: Trà thảo mộc × 2/)).toBeInTheDocument()
    expect(screen.getByText(/Chúc mừng!.*\(In\)/)).toBeInTheDocument()
    expect(screen.getByText(/Thiệp: Thiệp viết tay · miễn phí/)).toBeInTheDocument()
    expect(screen.getByText(/260\.000/)).toBeInTheDocument()
  })

  it('hiển thị chính sách snapshot (không đổi trả, đặt cọc) và các giai đoạn thanh toán', () => {
    render(<OrderDetailDialog order={order} onClose={vi.fn()} />)
    expect(screen.getByText(/Không đổi trả · Đặt cọc 50%/)).toBeInTheDocument()
    expect(screen.getByText('Đặt cọc')).toBeInTheDocument()
    expect(screen.getByText('Thanh toán phần còn lại')).toBeInTheDocument()
  })

  it('không hiển thị gì khi không có đơn', () => {
    render(<OrderDetailDialog order={null} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
