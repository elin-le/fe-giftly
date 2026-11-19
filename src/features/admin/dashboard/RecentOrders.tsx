import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { ORDER_STATUS_LABELS } from '@/features/orders/types'
import { formatDateTime } from '@/lib/format'
import { Money } from '../components/Money'
import type { DashboardStats } from '../analytics/types'
import { orderStatusColor } from '../orders/orderStatusColor'

export function RecentOrders({ orders }: { orders: DashboardStats['recentOrders'] }) {
  if (orders.length === 0) return <Typography color="text.secondary">Chưa có đơn hàng.</Typography>
  return (
    <Box component="ul" sx={{ m: 0, p: 0, display: 'grid', gap: 1 }}>
      {orders.map((order, index) => (
        <Box component="li" key={order.id} sx={{ listStyle: 'none', p: 1, borderRadius: 2, bgcolor: index % 2 ? 'row.zebra' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.orderNumber} <Typography component="span" variant="body2" color="text.secondary">· {order.customerName}</Typography></Typography>
            <Typography variant="caption" color="text.secondary">{formatDateTime(order.orderedAt)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Money amount={order.totalAmount} variant="body2" />
            <div><Chip size="small" color={orderStatusColor(order.status)} label={ORDER_STATUS_LABELS[order.status]} /></div>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
