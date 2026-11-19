import { formatCurrency } from '@/lib/format'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STAGE_LABELS,
  PAYMENT_STATUS_LABELS,
  type Payment,
} from '../types'

/** Các khoản thanh toán của đơn (một khoản, hoặc cọc + phần còn lại). */
export function PaymentList({ payments }: { payments: Payment[] }) {
  return (
    <ul className="flex flex-col gap-1 text-sm" aria-label="Thanh toán">
      {payments.map((payment) => (
        <li key={payment.id} className="flex flex-wrap justify-between gap-x-3 text-muted-foreground">
          <span>
            {PAYMENT_STAGE_LABELS[payment.paymentStage]} · {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
          </span>
          <span>
            <span className="font-semibold text-foreground">{formatCurrency(payment.amount)}</span> · {PAYMENT_STATUS_LABELS[payment.paymentStatus]}
          </span>
        </li>
      ))}
    </ul>
  )
}
