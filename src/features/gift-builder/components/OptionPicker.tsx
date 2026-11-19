import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { entryName, type VariantEntry } from '../catalog'

interface OptionPickerProps {
  label: string
  hint?: string
  entries: VariantEntry[]
  selectedIds: ReadonlySet<string>
  /** Giá hiển thị cho khách (0 → "Miễn phí"). */
  getPrice: (entry: VariantEntry) => number
  onToggle: (entry: VariantEntry) => void
}

/** Bật/tắt các biến thể (phụ kiện, thiệp); mỗi lựa chọn có số lượng 1. */
export function OptionPicker({ label, hint, entries, selectedIds, getPrice, onToggle }: OptionPickerProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1 font-semibold">
        {label} <span className="text-sm font-normal text-muted-foreground">{hint ?? '(tuỳ chọn)'}</span>
      </legend>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Hiện chưa có lựa chọn nào.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {entries.map((entry) => {
            const isSelected = selectedIds.has(entry.variant.id)
            const price = getPrice(entry)
            return (
              <li key={entry.variant.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(entry)}
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-raised',
                  )}
                >
                  {isSelected && <Check className="size-4" />}
                  {entryName(entry)}
                  <span className={isSelected ? 'opacity-80' : 'text-muted-foreground'}>{price === 0 ? 'Miễn phí' : formatCurrency(price)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </fieldset>
  )
}
