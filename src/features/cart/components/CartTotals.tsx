import { formatCurrency } from '@/lib/format'
import type { Cart } from '../types'

type CartTotalsProps = Pick<Cart, 'subtotal' | 'shippingFee' | 'totalAmount'> & Partial<Pick<Cart, 'requiredAdvanceAmount'>>

/** Tạm tính, phí vận chuyển và tổng cộng (số liệu do server tính). */
export function CartTotals({ subtotal, shippingFee, totalAmount, requiredAdvanceAmount = 0 }: CartTotalsProps) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="opacity-75">Tạm tính</dt>
        <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="opacity-75">Phí vận chuyển</dt>
        <dd className="font-semibold">{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-current/20 pt-3 text-lg font-bold">
        <dt>Tổng cộng</dt>
        <dd>{formatCurrency(totalAmount)}</dd>
      </div>
      {requiredAdvanceAmount > 0 && (
        <>
          <div className="flex justify-between gap-4">
            <dt>Đặt cọc khi đặt hàng</dt>
            <dd className="font-semibold">{formatCurrency(requiredAdvanceAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm opacity-80">
            <dt>Thanh toán phần còn lại</dt>
            <dd>{formatCurrency(Math.max(totalAmount - requiredAdvanceAmount, 0))}</dd>
          </div>
        </>
      )}
    </dl>
  )
}
