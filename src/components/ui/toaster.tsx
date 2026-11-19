import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { useToastStore, type ToastTone } from '@/stores/toastStore'

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: AlertCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-accent' },
}

/** Vùng hiển thị thông báo; đặt một lần trong layout. Nổi trên dock mobile. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 md:bottom-6"
    >
      <AnimatePresence>
        {toasts.map(({ id, message, tone }) => {
          const { icon: Icon, className } = TONE_STYLES[tone]
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 text-sm shadow-soft"
            >
              <Icon className={cn('size-5 shrink-0', className)} />
              <span className="flex-1">{message}</span>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Đóng thông báo"
                className="grid size-6 place-items-center rounded-full hover:bg-surface-raised"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
