import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { formatDateTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminApi } from '../api/adminApi'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { PageHeader } from '../components/PageHeader'
import { useAdminAction } from '../hooks/useAdminAction'
import { useNotice } from '../hooks/useNotice'
import type { AdminReview } from './types'

export function ReviewsPage() {
  const reviews = useAsync(() => adminApi.reviews(), [])
  const notice = useNotice()
  const { isBusy, run } = useAdminAction(notice, reviews.reload)
  const [target, setTarget] = useState<AdminReview | null>(null)

  const remove = async () => {
    if (target && (await run(() => adminApi.deleteReview(target.id), 'Đã xoá đánh giá'))) setTarget(null)
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Đánh giá" subtitle="Kiểm duyệt đánh giá của khách; đánh giá thấp được làm nổi bật để xử lý sớm" />
      {reviews.error && <Alert severity="error" action={<Button onClick={reviews.reload}>Thử lại</Button>}>{reviews.error}</Alert>}
      <DataTable
        label="Danh sách đánh giá"
        rows={reviews.data ?? []}
        isLoading={reviews.isLoading}
        getKey={(r) => r.id}
        isHighlighted={(r) => r.rating <= 2}
        columns={[
          { header: 'Sản phẩm', render: (r) => <Typography sx={{ fontWeight: 700 }}>{r.productName}</Typography> },
          { header: 'Điểm', render: (r) => <Rating readOnly size="small" value={r.rating} aria-label={`${r.rating} sao`} /> },
          { header: 'Nội dung', render: (r) => <><Typography sx={{ fontWeight: 600 }}>{r.title ?? ''}</Typography><Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 420 }}>{r.comment ?? '—'}</Typography></> },
          { header: 'Khách', render: (r) => r.userName },
          { header: 'Ngày', render: (r) => formatDateTime(r.createdAt) },
          { header: '', align: 'right', render: (r) => <IconButton color="error" aria-label={`Xoá đánh giá của ${r.userName}`} onClick={() => setTarget(r)}><DeleteIcon /></IconButton> },
        ]}
      />
      <ConfirmDialog open={target !== null} title="Xoá đánh giá?" message="Đánh giá sẽ bị xoá và điểm trung bình của sản phẩm được tính lại." confirmLabel="Xoá" isBusy={isBusy} onConfirm={remove} onCancel={() => setTarget(null)} />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
