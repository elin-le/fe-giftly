import { Label } from '@/components/ui/label'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/features/orders/types'

interface PaymentPickerProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  /** Đơn có đặt cọc: không cho thanh toán khi nhận hàng. */
  codDisabled?: boolean
}

export function PaymentPicker({ value, onChange, codDisabled = false }: PaymentPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold">Phương thức thanh toán</legend>
      {codDisabled && <p className="text-sm text-warning">Đơn có khoản đặt cọc nên cần thanh toán trước, không áp dụng thanh toán khi nhận hàng.</p>}
      {PAYMENT_METHODS.map((method) => {
        const disabled = codDisabled && method === 'COD'
        return (
          <Label
            key={method}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4 font-normal has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
          >
            <input type="radio" name="paymentMethod" className="accent-primary" disabled={disabled} checked={value === method} onChange={() => onChange(method)} />
            {PAYMENT_METHOD_LABELS[method]}
          </Label>
        )
      })}
    </fieldset>
  )
}
