import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { COMPONENT_ROLE_LABELS, MESSAGE_RENDERING_LABELS } from '@/features/products/types'
import { formatAddress } from '@/features/addresses/formatAddress'
import { isItemNoReturn } from '@/features/orders/orderRules'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STAGE_LABELS, PAYMENT_STATUS_LABELS, type Order } from '@/features/orders/types'
import { formatCurrency, formatDateTime } from '@/lib/format'

interface OrderDetailDialogProps {
  order: Order | null
  onClose: () => void
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  return (
    <Dialog open={order !== null} onClose={onClose} fullWidth maxWidth="sm">
      {order && (
        <>
          <DialogTitle>Đơn hàng {order.orderNumber}</DialogTitle>
          <DialogContent>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Detail label="Ngày đặt" value={formatDateTime(order.orderedAt)} />
              <Detail label="Trạng thái" value={ORDER_STATUS_LABELS[order.status]} />
              <Detail label="Khách hàng" value={`${order.customer.fullName} (${order.customer.email})`} />
              <Detail label="Người nhận" value={`${order.address.recipientName} · ${order.address.phone}`} />
              <Detail label="Địa chỉ" value={formatAddress(order.address)} />
              {order.payments.map((payment) => (
                <Detail
                  key={payment.id}
                  label={PAYMENT_STAGE_LABELS[payment.paymentStage]}
                  value={`${formatCurrency(payment.amount)} · ${PAYMENT_METHOD_LABELS[payment.paymentMethod]} · ${PAYMENT_STATUS_LABELS[payment.paymentStatus]}`}
                />
              ))}
            </Stack>
            <Divider />
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {order.items.map((item) => (
                <Stack key={item.id} spacing={0.5}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: item.giftBoxConfigId ? 700 : 400 }}>
                      {item.itemNameSnapshot}
                      {item.variantSnapshot ? ` (${Object.values(item.variantSnapshot).join(' · ')})` : ''} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatCurrency(item.subtotal)}
                    </Typography>
                  </Stack>
                  {(isItemNoReturn(item) || item.requiredAdvanceAmount !== null) && (
                    <Typography variant="caption" color="warning.main">
                      {[isItemNoReturn(item) && 'Không đổi trả', item.requiredAdvanceAmount !== null && `Đặt cọc ${item.advancePaymentPercentSnapshot}% (${formatCurrency(item.requiredAdvanceAmount)})`].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                  {item.components.map((c) => (
                    <Typography key={c.id} variant="body2" color="text.secondary">
                      {c.componentRole ? `${COMPONENT_ROLE_LABELS[c.componentRole]}: ` : ''}
                      {c.productNameSnapshot}
                      {c.quantity > 1 ? ` × ${c.quantity}` : ''}
                      {c.isComplimentary ? ' · miễn phí' : ''}
                      {c.messageText ? ` — “${c.messageText}”${c.messageRenderingMethod ? ` (${MESSAGE_RENDERING_LABELS[c.messageRenderingMethod]})` : ''}` : ''}
                    </Typography>
                  ))}
                </Stack>
              ))}
              <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
                <Typography color="text.secondary">Phí vận chuyển</Typography>
                <Typography>{formatCurrency(order.shippingFee)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>Tổng cộng</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</Typography>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose}>Đóng</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={3} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}
