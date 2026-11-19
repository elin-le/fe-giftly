import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const fieldClass =
  'w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-[invalid=true]:border-danger disabled:opacity-50'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(fieldClass, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(fieldClass, 'min-h-24 py-3', className)} {...props} />
}
