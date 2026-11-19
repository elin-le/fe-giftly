import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { BUILDER_STEPS } from '../builderSteps'

interface BuilderStepperProps {
  currentIndex: number
  maxReachableIndex: number
  onSelect: (index: number) => void
}

export function BuilderStepper({ currentIndex, maxReachableIndex, onSelect }: BuilderStepperProps) {
  return (
    <ol aria-label="Các bước thiết kế hộp quà" className="flex items-center justify-between gap-1">
      {BUILDER_STEPS.map((step, index) => {
        const isCurrent = index === currentIndex
        const isDone = index < currentIndex
        const isLocked = index > maxReachableIndex

        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={isLocked}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(index)}
              className="flex items-center gap-2 rounded-full py-1 pr-1 disabled:opacity-40 sm:pr-3"
            >
              <span
                className={cn(
                  'relative grid size-9 place-items-center rounded-full border text-sm font-bold transition-colors',
                  isCurrent || isDone ? 'border-primary text-primary-foreground' : 'border-border text-muted-foreground',
                )}
              >
                {(isCurrent || isDone) && (
                  <motion.span
                    layoutId={isCurrent ? 'builder-step-current' : undefined}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative">{isDone ? <Check className="size-4" /> : index + 1}</span>
              </span>
              <span className={cn('text-sm font-semibold', isCurrent ? 'inline' : 'hidden sm:inline')}>{step.label}</span>
            </button>
            {index < BUILDER_STEPS.length - 1 && <span aria-hidden className="h-px min-w-3 flex-1 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}
