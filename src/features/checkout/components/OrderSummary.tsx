import { getCartItemName } from '@/features/cart/cartItemName'
import { CartTotals } from '@/features/cart/components/CartTotals'
import type { Cart } from '@/features/cart/types'
import { PolicyNotes } from '@/features/gift-builder/components/PolicyNotes'
import { formatCurrency } from '@/lib/format'

export function OrderSummary({ cart }: { cart: Cart }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <h2 className="text-lg font-bold">Đơn hàng của bạn</h2>
      <ul className="flex flex-col gap-3 text-sm">
        {cart.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1">
            <div className="flex justify-between gap-4">
              <span>
                {getCartItemName(item)} <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
            </div>
            <PolicyNotes policy={item} subtotal={item.subtotal} />
          </li>
        ))}
      </ul>
      <div className="border-t border-border pt-4">
        <CartTotals subtotal={cart.subtotal} shippingFee={cart.shippingFee} totalAmount={cart.totalAmount} requiredAdvanceAmount={cart.requiredAdvanceAmount} />
      </div>
    </div>
  )
}
