import { Check } from 'lucide-react'
import { CardMessageEditor } from '@/features/gift-builder/components/CardMessageEditor'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { setOptionMessage, toggleOption, type BundleChoice } from '../bundleSelection'
import type { Bundle } from '../types'

interface BundleOptionPickerProps {
  bundle: Bundle
  choice: BundleChoice
  onChange: (choice: BundleChoice) => void
}

/** Các nhóm tuỳ chọn của set quà (thiệp, phụ kiện…); thiệp được chọn sẽ có ô lời chúc. */
export function BundleOptionPicker({ bundle, choice, onChange }: BundleOptionPickerProps) {
  return (
    <div className="flex flex-col gap-6">
      {bundle.optionGroups.map((group) => {
        const picked = choice.picked[group.id] ?? []
        const hint = group.isRequired ? '(bắt buộc)' : group.selectionType === 'MULTIPLE' ? `(chọn tối đa ${group.maxSelections ?? '∞'})` : '(tuỳ chọn)'
        return (
          <fieldset key={group.id} className="flex min-w-0 flex-col gap-2">
            <legend className="mb-1 font-semibold">
              {group.name} <span className="text-sm font-normal text-muted-foreground">{hint}</span>
            </legend>
            <ul className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isSelected = picked.includes(option.id)
                const isOut = option.stockQuantity === 0
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isOut}
                      onClick={() => onChange(toggleOption(choice, bundle, group.id, option.id))}
                      className={cn(
                        'flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50',
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-raised',
                      )}
                    >
                      {isSelected && <Check className="size-4" />}
                      {option.productName}
                      {option.optionLabel && ` (${option.optionLabel})`}
                      <span className={isSelected ? 'opacity-80' : 'text-muted-foreground'}>
                        {isOut ? 'Hết hàng' : option.price === 0 ? 'Miễn phí' : `+${formatCurrency(option.price)}`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {group.options
              .filter((option) => picked.includes(option.id) && option.productType === 'GREETING_CARD')
              .map((option) => (
                <CardMessageEditor
                  key={option.id}
                  id={`bundle-${option.id}`}
                  title={option.productName}
                  message={choice.messages[option.id]?.text ?? ''}
                  method={choice.messages[option.id]?.method ?? 'HANDWRITTEN'}
                  onMessageChange={(text) => onChange(setOptionMessage(choice, option.id, { text }))}
                  onMethodChange={(method) => onChange(setOptionMessage(choice, option.id, { method }))}
                />
              ))}
          </fieldset>
        )
      })}
    </div>
  )
}
