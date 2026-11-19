import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDimensions, formatWeight } from '@/features/gift-builder/fit'
import type { GiftBoxRequest } from '@/features/gift-builder/types'
import { Money } from '../components/Money'
import { formatOverflow, getZaloLink } from './requestRules'

interface RequestDetailProps {
  request: GiftBoxRequest
  isBusy: boolean
  onApprove: () => void
  onReject: () => void
}

/** Chi tiết một yêu cầu: sức chứa hộp, các món, ghi chú hệ thống và cách liên hệ khách. */
export function RequestDetail({ request, isBusy, onApprove, onReject }: RequestDetailProps) {
  const { view, customer } = request
  const zalo = getZaloLink(customer.phone)
  const canDecide = view.reviewStatus !== 'APPROVED'
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <Typography variant="body2">
        <b>Hộp:</b> {view.box.productName}{view.box.optionLabel ? ` (${view.box.optionLabel})` : ''}
        {request.inner && <> · lòng hộp {formatDimensions(request.inner)}</>}
        {request.maxWeight && <> · tối đa {formatWeight(request.maxWeight)}</>} · <b>mức dùng {formatOverflow(view.capacityRatio)}</b>
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {view.items.map((line) => (
          <li key={line.variantId}>
            {line.quantity} × {line.productName}{line.optionLabel ? ` (${line.optionLabel})` : ''}
            {line.messageText && <i> — “{line.messageText}”</i>}
          </li>
        ))}
      </Box>
      {view.reviewNote && <Typography variant="body2" color="text.secondary">Ghi chú: {view.reviewNote}</Typography>}
      <Typography variant="body2">
        <b>Liên hệ:</b> {customer.fullName} · {customer.email}
        {customer.phone && <> · {customer.phone}</>}
        {zalo && <> · <Link href={zalo} target="_blank" rel="noopener noreferrer">Nhắn Zalo</Link></>}
      </Typography>
      <Typography variant="body2">Giá hộp: <Money amount={view.price} /></Typography>
      {canDecide && (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="success" disabled={isBusy} onClick={onApprove}>Duyệt</Button>
          <Button variant="outlined" color="error" disabled={isBusy} onClick={onReject}>Từ chối…</Button>
        </Stack>
      )}
    </Stack>
  )
}
