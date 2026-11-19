import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { MAX_CONTENT_ITEMS } from '../constants'
import { formatWeight } from '../fit'
import { getDraftNotice, getFill } from '../giftBox'
import type { GiftBoxDraft } from '../types'

/** Thanh độ đầy của hộp (khối lượng / thể tích / số món — lấy chỉ số chặt nhất). */
export function FitMeter({ draft }: { draft: GiftBoxDraft }) {
  const fill = getFill(draft)
  const notice = getDraftNotice(draft)
  const percent = Math.min(Math.round(fill.ratio * 100), 100)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Độ đầy của hộp</span>
        <span className={cn('font-semibold', fill.isOver && 'text-danger')} aria-live="polite">
          {fill.isOver ? 'Vượt sức chứa' : `${percent}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Độ đầy của hộp"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-surface-raised"
      >
        <motion.div
          className={cn('h-full rounded-full', fill.isOver ? 'bg-danger' : 'bg-accent')}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {fill.count}/{MAX_CONTENT_ITEMS} món
        {fill.maxWeightG !== null && ` · ${formatWeight({ value: fill.weightUsedG, unit: 'G' })} / ${formatWeight({ value: fill.maxWeightG, unit: 'G' })}`}
      </p>
      {notice && <FitNotice {...notice} />}
    </div>
  )
}

function FitNotice({ tone, text }: { tone: 'info' | 'warning'; text: string }) {
  return (
    <p
      role="status"
      className={cn('rounded-2xl p-3 text-xs font-medium', tone === 'warning' ? 'bg-accent-soft text-accent-foreground' : 'bg-lilac-soft text-foreground')}
    >
      {text}
    </p>
  )
}
