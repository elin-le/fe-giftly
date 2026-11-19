import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatAddress } from '@/features/addresses/formatAddress'
import type { Address } from '@/features/addresses/types'
import type { Cart } from '@/features/cart/types'
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/features/orders/types'
import { formatCurrency } from '@/lib/format'

interface ConfirmOrderDialogProps {
  open: boolean
  address: Address | null
  paymentMethod: PaymentMethod
  cart: Cart | null
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmOrderDialog({
  open,
  address,
  paymentMethod,
  cart,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
}: ConfirmOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSubmitting && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận đơn hàng</DialogTitle>
          <DialogDescription>Vui lòng kiểm tra lại thông tin trước khi đặt hàng.</DialogDescription>
        </DialogHeader>

        {address && cart && (
          <dl className="flex flex-col gap-3 text-sm">
            <Row label="Người nhận" value={address.recipientName} />
            <Row label="Điện thoại" value={address.phone} />
            <Row label="Địa chỉ" value={formatAddress(address)} />
            <Row label="Thanh toán" value={PAYMENT_METHOD_LABELS[paymentMethod]} />
            <Row label="Sản phẩm" value={`${cart.items.length} dòng · ${cart.items.reduce((n, i) => n + i.quantity, 0)} món`} />
            <Row label="Phí vận chuyển" value={cart.shippingFee === 0 ? 'Miễn phí' : formatCurrency(cart.shippingFee)} />
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd>{formatCurrency(cart.totalAmount)}</dd>
            </div>
            {cart.requiredAdvanceAmount > 0 && (
              <>
                <Row label="Đặt cọc ngay" value={formatCurrency(cart.requiredAdvanceAmount)} />
                <Row label="Thanh toán phần còn lại" value={formatCurrency(Math.max(cart.totalAmount - cart.requiredAdvanceAmount, 0))} />
              </>
            )}
            {cart.items.some((item) => item.returnPolicy === 'NO_RETURN') && (
              <p className="rounded-2xl bg-accent-soft p-3 text-xs text-accent-foreground">
                Đơn có sản phẩm không đổi trả. Vui lòng kiểm tra kỹ trước khi đặt hàng.
              </p>
            )}
          </dl>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Quay lại chỉnh sửa
          </Button>
          <Button variant="accent" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? 'Đang đặt hàng…' : 'Xác nhận đặt hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}
