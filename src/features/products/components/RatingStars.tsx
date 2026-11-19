import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

interface RatingStarsProps {
  value: number | null
  count?: number
  className?: string
}

/** Điểm trung bình dạng sao; chưa có đánh giá thì hiện "Chưa có đánh giá". */
export function RatingStars({ value, count, className }: RatingStarsProps) {
  if (value === null || count === 0) {
    return <span className={cn('text-sm text-muted-foreground', className)}>Chưa có đánh giá</span>
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)} aria-label={`${value} trên 5 sao`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn('size-4', star <= Math.round(value) ? 'fill-accent text-accent' : 'text-border')} />
        ))}
      </span>
      <span className="font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  )
}
