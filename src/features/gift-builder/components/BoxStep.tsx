import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { VariantEntry } from '../catalog'
import { formatDimensions, formatWeight } from '../fit'
import type { GiftBoxDraft } from '../types'

interface BoxStepProps {
  boxes: VariantEntry[]
  draft: GiftBoxDraft
  onSelect: (box: VariantEntry) => void
}

export function BoxStep({ boxes, draft, onSelect }: BoxStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">Chọn chiếc hộp sẽ đựng quà của bạn. Kích thước lòng hộp quyết định số món có thể xếp vào.</p>
      <div role="radiogroup" aria-label="Chọn hộp quà" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {boxes.map((entry) => {
          const { product, variant, label } = entry
          const isSelected = draft.box?.variantId === variant.id
          const detail = variant.giftBoxDetail
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(entry)}
              className={cn(
                'relative flex min-w-0 flex-col gap-1 rounded-card border p-5 text-left transition-all',
                isSelected ? 'border-primary bg-surface-raised shadow-soft' : 'border-border bg-surface hover:-translate-y-0.5',
              )}
            >
              {isSelected && (
                <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
              )}
              <span className="text-lg font-bold">
                {product.name}
                {label && <span className="font-normal text-muted-foreground"> · {label}</span>}
              </span>
              {detail?.inner && <span className="text-sm text-muted-foreground">Lòng hộp {formatDimensions(detail.inner)}</span>}
              {detail?.maxWeight && <span className="text-sm text-muted-foreground">Chứa tối đa {formatWeight(detail.maxWeight)}</span>}
              <span className="mt-2 font-bold">{formatCurrency(variant.price)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
