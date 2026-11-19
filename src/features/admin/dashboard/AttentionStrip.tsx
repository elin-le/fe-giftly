import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Link } from 'react-router-dom'

interface AttentionStripProps {
  pendingOrders: number
  pendingGiftBoxRequests: number
  lowStockVariants: number
}

/** Việc cần xử lý ngay: chỉ hiện những mục có số lượng > 0, mỗi mục dẫn tới trang xử lý. */
export function AttentionStrip({ pendingOrders, pendingGiftBoxRequests, lowStockVariants }: AttentionStripProps) {
  const items = [
    { count: pendingGiftBoxRequests, severity: 'warning' as const, text: `${pendingGiftBoxRequests} yêu cầu hộp quà vượt kích thước đang chờ duyệt`, to: '/admin/gift-box-requests', action: 'Xem yêu cầu' },
    { count: pendingOrders, severity: 'info' as const, text: `${pendingOrders} đơn hàng chờ xác nhận`, to: '/admin/orders', action: 'Xử lý đơn' },
    { count: lowStockVariants, severity: 'error' as const, text: `${lowStockVariants} biến thể sắp hết hoặc đã hết hàng`, to: '/admin/products', action: 'Kiểm tra kho' },
  ].filter((item) => item.count > 0)
  if (items.length === 0) return null

  return (
    <Stack spacing={1} aria-label="Việc cần xử lý">
      {items.map((item) => (
        <Alert key={item.to} severity={item.severity} action={<Button component={Link} to={item.to} size="small" color="inherit">{item.action}</Button>}>
          {item.text}
        </Alert>
      ))}
    </Stack>
  )
}
