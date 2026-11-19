import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { giftBoxApi } from '@/features/gift-builder/api/giftBoxApi'
import type { GiftBoxRequest } from '@/features/gift-builder/types'
import { formatDateTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { PageHeader } from '../components/PageHeader'
import { useAdminAction } from '../hooks/useAdminAction'
import { useNotice } from '../hooks/useNotice'
import { RejectDialog } from './RejectDialog'
import { RequestDetail } from './RequestDetail'
import { countPending, formatOverflow, REVIEW_STATUS_COLORS, REVIEW_STATUS_LABELS } from './requestRules'

/** Hộp quà tùy chỉnh vượt kích thước nhưng còn trong mức chấp nhận: admin xem xét, liên hệ khách rồi duyệt/từ chối. */
export function GiftBoxRequestsPage() {
  const requests = useAsync(() => giftBoxApi.listRequests(), [])
  const notice = useNotice()
  const { isBusy, run } = useAdminAction(notice, requests.reload)
  const [openId, setOpenId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const list: GiftBoxRequest[] = requests.data ?? []
  const pending = countPending(list)

  const reject = async (note: string) => {
    const id = rejectId
    if (id && (await run(() => giftBoxApi.decide(id, { decision: 'REJECTED', note }), 'Đã từ chối — khách có thể chỉnh lại'))) setRejectId(null)
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Yêu cầu hộp quà" subtitle={pending > 0 ? `${pending} yêu cầu đang chờ bạn xem xét` : 'Không có yêu cầu nào đang chờ'} />
      {requests.error && <Alert severity="error" action={<Button onClick={requests.reload}>Thử lại</Button>}>{requests.error}</Alert>}
      {!requests.isLoading && list.length === 0 && <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>Chưa có hộp quà nào vượt kích thước.</Typography>}
      {list.map((request) => {
        const { view, customer } = request
        const isPending = view.reviewStatus === 'PENDING'
        return (
          <Paper key={request.id} variant="outlined" sx={{ overflow: 'hidden', ...(isPending && { borderColor: 'warning.main', boxShadow: (t) => `inset 5px 0 0 ${t.palette.warning.main}` }) }}>
            <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size="small" color={REVIEW_STATUS_COLORS[view.reviewStatus]} label={REVIEW_STATUS_LABELS[view.reviewStatus]} />
              <Typography sx={{ fontWeight: 800, flex: 1, minWidth: 160 }}>{customer.fullName}{request.orderNumber ? ` · đơn ${request.orderNumber}` : ' · trong giỏ'}</Typography>
              <Typography sx={{ fontWeight: 800, color: 'warning.main' }}>Vượt {formatOverflow(view.capacityRatio)}</Typography>
              <Typography variant="body2" color="text.secondary">{formatDateTime(request.updatedAt)}</Typography>
              <Button size="small" aria-expanded={openId === request.id} onClick={() => setOpenId(openId === request.id ? null : request.id)}>{openId === request.id ? 'Thu gọn' : 'Xem chi tiết'}</Button>
            </Stack>
            <Collapse in={openId === request.id} unmountOnExit>
              <RequestDetail request={request} isBusy={isBusy} onApprove={() => void run(() => giftBoxApi.decide(request.id, { decision: 'APPROVED' }), 'Đã duyệt yêu cầu')} onReject={() => setRejectId(request.id)} />
            </Collapse>
          </Paper>
        )
      })}
      <RejectDialog key={rejectId ?? 'none'} open={rejectId !== null} isBusy={isBusy} onSubmit={(note) => void reject(note)} onClose={() => setRejectId(null)} />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
