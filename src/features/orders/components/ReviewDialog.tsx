import { Loader2, Star } from 'lucide-react'
import { useState } from 'react'
import { toApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import { reviewsApi } from '../api/reviewsApi'
import type { Review, ReviewPayload } from '../types'

/** Nguồn mua được đánh giá: dòng đơn HOẶC thành phần trong set/hộp. */
export interface ReviewTarget {
  /** Tên hiển thị. */
  name: string
  source: { orderItemId: string } | { orderItemComponentId: string }
}

interface ReviewDialogProps {
  target: ReviewTarget | null
  onClose: () => void
  onCreated: (review: Review) => void
}

export function ReviewDialog({ target, onClose, onCreated }: ReviewDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>{target && <ReviewForm key={JSON.stringify(target.source)} target={target} onClose={onClose} onCreated={onCreated} />}</DialogContent>
    </Dialog>
  )
}

function ReviewForm({ target, onClose, onCreated }: { target: ReviewTarget; onClose: () => void; onCreated: (review: Review) => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (rating < 1 || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    const payload: ReviewPayload = { ...target.source, rating, title: title.trim() || undefined, comment: comment.trim() || undefined }
    try {
      onCreated(await reviewsApi.create(payload))
      onClose()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogDescription>{target.name}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Điểm đánh giá" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} sao`}
              onClick={() => setRating(value)}
              className="rounded-full p-1 transition-transform hover:scale-110"
            >
              <Star className={cn('size-7', value <= rating ? 'fill-accent text-accent' : 'text-border')} />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-title">Tiêu đề</Label>
          <Input id="review-title" value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-comment">Nhận xét</Label>
          <Textarea id="review-comment" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button variant="accent" onClick={() => void submit()} disabled={rating < 1 || isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Gửi đánh giá
        </Button>
      </DialogFooter>
    </>
  )
}
