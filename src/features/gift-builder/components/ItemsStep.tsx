import { QuantityStepper } from '@/components/ui/quantity-stepper'
import { ProductImage } from '@/features/products/components/ProductImage'
import { formatCurrency } from '@/lib/format'
import type { VariantEntry } from '../catalog'
import { getItemQuantity } from '../giftBox'
import type { GiftBoxDraft } from '../types'
import { FitMeter } from './FitMeter'

interface ItemsStepProps {
  items: VariantEntry[]
  draft: GiftBoxDraft
  onQuantityChange: (entry: VariantEntry, quantity: number) => void
}

export function ItemsStep({ items, draft, onQuantityChange }: ItemsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <FitMeter draft={draft} />

      {items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Hiện chưa có món nào để thêm vào hộp.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((entry) => {
            const { product, variant, label } = entry
            const quantity = getItemQuantity(draft, variant.id)
            const name = label ? `${product.name} (${label})` : product.name

            return (
              <li key={variant.id} className="flex min-w-0 items-center gap-3 rounded-card border border-border bg-surface p-3">
                <div className="w-16 shrink-0 overflow-hidden rounded-2xl">
                  <ProductImage product={product} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold">{product.name}</span>
                  {label && <span className="truncate text-sm text-muted-foreground">{label}</span>}
                  <span className="text-sm text-muted-foreground">{formatCurrency(variant.price)}</span>
                  {variant.policy?.returnPolicy === 'NO_RETURN' && <span className="text-xs text-danger">Không đổi trả</span>}
                  {(variant.policy?.advancePaymentPercent ?? 0) > 0 && (
                    <span className="text-xs text-warning">Đặt cọc {variant.policy?.advancePaymentPercent}%</span>
                  )}
                </div>
                <QuantityStepper value={quantity} max={variant.stockQuantity} label={name} onChange={(next) => onQuantityChange(entry, next)} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
