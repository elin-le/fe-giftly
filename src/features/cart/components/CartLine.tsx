import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { QuantityStepper } from '@/components/ui/quantity-stepper'
import { PolicyNotes } from '@/features/gift-builder/components/PolicyNotes'
import { formatCurrency } from '@/lib/format'
import { getCartItemName } from '../cartItemName'
import type { VariantCartItem } from '../types'
import { VariantThumb } from './CartItemThumb'

interface CartLineProps {
  item: VariantCartItem
  /** Đang đồng bộ với server: khoá nút để không gửi chồng thao tác. */
  disabled?: boolean
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartLine({ item, disabled = false, onQuantityChange, onRemove }: CartLineProps) {
  const { variant, selections } = item
  const name = getCartItemName(item)

  return (
    <li className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-pop sm:flex-row sm:items-center sm:gap-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <VariantThumb productId={variant.productId} name={variant.productName} imageUrl={variant.imageUrl} productType={variant.productType} />
        <div className="flex min-w-0 flex-col gap-1">
          <Link to={`/products/${variant.productId}`} className="line-clamp-2 font-bold leading-snug hover:underline">
            {variant.productName}
          </Link>
          {variant.optionLabel && <span className="w-fit rounded-full bg-lilac-soft px-2.5 py-0.5 text-xs font-semibold text-foreground">{variant.optionLabel}</span>}
          {selections.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-sm">
              {selections.map((selection) => (
                <li key={selection.bundleOptionId} className="break-words">
                  <span className="text-muted-foreground">Kèm: </span>
                  {selection.productName}
                  {selection.unitPrice === 0 ? <span className="text-muted-foreground"> · miễn phí</span> : <span className="text-muted-foreground"> · +{formatCurrency(selection.unitPrice)}</span>}
                  {selection.messageText && <span className="block italic">“{selection.messageText}”</span>}
                </li>
              ))}
            </ul>
          )}
          <span className="text-sm font-semibold text-primary">{formatCurrency(item.unitPrice)}</span>
          <PolicyNotes policy={item} subtotal={item.subtotal} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <QuantityStepper
          value={item.quantity}
          max={variant.stockQuantity}
          label={`số lượng ${name}`}
          disabled={disabled}
          onChange={(quantity) => onQuantityChange(item.id, quantity)}
        />
        <span className="w-28 text-right text-lg font-bold">{formatCurrency(item.subtotal)}</span>
        <Button
          size="icon"
          variant="ghost"
          className="size-10 text-danger"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          aria-label={`Xoá ${name} khỏi giỏ`}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  )
}
