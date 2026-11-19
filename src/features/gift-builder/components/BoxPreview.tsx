import { PackageOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { calcGiftBoxTotal, countItems } from '../giftBox'
import type { GiftBoxDraft } from '../types'
import { FitMeter } from './FitMeter'

/** Tóm tắt trực quan hộp đang thiết kế: danh sách món và độ đầy. */
export function BoxPreview({ draft }: { draft: GiftBoxDraft }) {
  const { box } = draft
  if (!box) {
    return (
      <div className="grid place-items-center gap-2 rounded-card border border-border bg-surface py-10 text-center text-muted-foreground shadow-soft">
        <PackageOpen className="size-10" strokeWidth={1.25} />
        <p className="text-sm">Chọn một chiếc hộp để bắt đầu.</p>
      </div>
    )
  }

  const count = countItems(draft.items)

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-soft">
      <div role="img" aria-label={`${box.productName}, ${count} món`} className="overflow-hidden rounded-3xl border border-border">
        <div className="h-3 bg-accent" />
        <div className="flex flex-wrap gap-2 bg-surface-raised p-3">
          {draft.items.length === 0 && <span className="text-sm text-muted-foreground">Hộp đang trống</span>}
          {draft.items.map((item) => (
            <span key={item.variantId} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {item.productName} × {item.quantity}
            </span>
          ))}
        </div>
      </div>
      <FitMeter draft={draft} />
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold">{box.productName}</p>
          <p className="text-sm text-muted-foreground">{count} món</p>
        </div>
        <p className="shrink-0 text-xl font-bold">{formatCurrency(calcGiftBoxTotal(draft))}</p>
      </div>
    </div>
  )
}
