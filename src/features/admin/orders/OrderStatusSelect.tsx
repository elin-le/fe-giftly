import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { getNextStatuses } from '@/features/orders/orderStatus'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/features/orders/types'

interface OrderStatusSelectProps {
  orderCode: string
  status: OrderStatus
  disabled?: boolean
  onChange: (next: OrderStatus) => void
}

/** Chỉ cho chọn trạng thái hiện tại và các trạng thái kế tiếp hợp lệ. */
export function OrderStatusSelect({ orderCode, status, disabled, onChange }: OrderStatusSelectProps) {
  const options = [status, ...getNextStatuses(status)]

  return (
    <Select
      size="small"
      value={status}
      disabled={disabled || options.length === 1}
      onChange={(event) => onChange(event.target.value as OrderStatus)}
      inputProps={{ 'aria-label': `Trạng thái đơn ${orderCode}` }}
      sx={{ minWidth: 150 }}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {ORDER_STATUS_LABELS[option]}
        </MenuItem>
      ))}
    </Select>
  )
}
