import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { MergedPolicy } from '@/features/products/policy'
import { calcAdvanceAmount } from '@/features/products/policy'

interface PolicyNotesProps {
  policy: Pick<MergedPolicy, 'returnPolicy' | 'advancePaymentPercent'>
  /** Nếu có sẽ hiển thị số tiền cọc cụ thể. */
  subtotal?: number
}

/** Ghi chú chính sách: không đổi trả và/hoặc yêu cầu đặt cọc. Không hiển thị gì nếu không có. */
export function PolicyNotes({ policy, subtotal }: PolicyNotesProps) {
  const notes: string[] = []
  if (policy.returnPolicy === 'NO_RETURN') notes.push('Không đổi trả')
  if (policy.advancePaymentPercent > 0) {
    notes.push(
      subtotal === undefined
        ? `Đặt cọc ${policy.advancePaymentPercent}%`
        : `Đặt cọc ${policy.advancePaymentPercent}% (${formatCurrency(calcAdvanceAmount(subtotal, policy.advancePaymentPercent))})`,
    )
  }
  if (notes.length === 0) return null

  return (
    <p className="flex items-start gap-1.5 text-xs text-warning">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{notes.join(' · ')}</span>
    </p>
  )
}
