import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface QuantityStepperProps {
  value: number
  max: number
  /** Tên đối tượng, dùng cho nhãn truy cập: "Tăng <label>". */
  label: string
  onChange: (quantity: number) => void
  disabled?: boolean
  className?: string
}

export function QuantityStepper({ value, max, label, onChange, disabled = false, className }: QuantityStepperProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-full border border-border p-1', className)}>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={disabled || value <= 0}
        onClick={() => onChange(value - 1)}
        aria-label={`Giảm ${label}`}
      >
        <Minus />
      </Button>
      <span aria-live="polite" className="min-w-6 text-center font-semibold">
        {value}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={`Tăng ${label}`}
      >
        <Plus />
      </Button>
    </div>
  )
}
