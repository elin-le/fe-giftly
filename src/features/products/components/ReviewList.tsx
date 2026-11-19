import { formatDateTime } from '@/lib/format'
import type { Review } from '@/features/orders/types'
import { RatingStars } from './RatingStars'

/** Danh sách đánh giá của sản phẩm (đã gộp mọi biến thể). */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">{review.userName}</span>
            <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
              {formatDateTime(review.createdAt)}
            </time>
          </div>
          <RatingStars value={review.rating} />
          {review.title && <p className="font-semibold">{review.title}</p>}
          {review.comment && <p className="text-sm">{review.comment}</p>}
        </li>
      ))}
    </ul>
  )
}
