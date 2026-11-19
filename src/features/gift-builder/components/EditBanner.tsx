import { Pencil } from 'lucide-react'
import type { GiftBoxView } from '../types'
import { ReviewStatusBadge } from './ReviewStatusBadge'

/** Đầu trang khi khách sửa yêu cầu đã gửi: trạng thái duyệt và phản hồi của admin (nếu có). */
export function EditBanner({ view, error }: { view: GiftBoxView | null; error: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
        {error}
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2 rounded-card border border-accent/50 bg-accent-soft p-4 text-sm text-accent-foreground">
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        <Pencil className="size-4" /> Bạn đang chỉnh sửa yêu cầu hộp quà
        {view && <ReviewStatusBadge status={view.reviewStatus} />}
      </p>
      {view?.reviewNote && <p>Phản hồi: {view.reviewNote}</p>}
      <p className="opacity-80">Bạn có thể chỉnh sửa cho tới khi Giftly duyệt yêu cầu.</p>
    </div>
  )
}
