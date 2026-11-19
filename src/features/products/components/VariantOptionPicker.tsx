import { cn } from '@/lib/cn'
import { isOptionValueAvailable, type OptionSelection } from '../productRules'
import type { Product } from '../types'

interface VariantOptionPickerProps {
  product: Pick<Product, 'options' | 'variants'>
  selection: OptionSelection
  onChange: (optionId: string, valueId: string) => void
}

/** Chọn từng thuộc tính (màu, cỡ…) của sản phẩm; giá trị không còn hàng ở tổ hợp hiện tại bị làm mờ. */
export function VariantOptionPicker({ product, selection, onChange }: VariantOptionPickerProps) {
  const options = [...product.options].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="flex flex-col gap-4">
      {options.map((option) => (
        <div key={option.id} role="radiogroup" aria-label={option.name} className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{option.name}</span>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selection[option.id] === value.id
              const isAvailable = isOptionValueAvailable(product, selection, option.id, value.id)
              return (
                <button
                  key={value.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange(option.id, value.id)}
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-raised',
                    !isAvailable && !isSelected && 'opacity-50 line-through',
                  )}
                >
                  {value.colorHex && <span className="size-3.5 rounded-full border border-border" style={{ backgroundColor: value.colorHex }} aria-hidden />}
                  {value.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
