import VisibilityIcon from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { viVN } from '@mui/x-data-grid/locales'
import { useMemo, useState } from 'react'
import { toApiError } from '@/api/errors'
import { ordersApi } from '@/features/orders/api/ordersApi'
import type { Order, OrderStatus } from '@/features/orders/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { useNotice } from '../hooks/useNotice'
import { OrderDetailDialog } from './OrderDetailDialog'
import { OrderStatusSelect } from './OrderStatusSelect'

export function AdminOrdersPage() {
  const orders = useAsync(() => ordersApi.list(), [])
  const notice = useNotice()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id)
    try {
      await ordersApi.updateStatus(order.id, status)
      notice.success(`Đã cập nhật đơn ${order.orderNumber}`)
      orders.reload()
    } catch (error) {
      notice.error(toApiError(error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  const columns = useMemo<GridColDef<Order>[]>(
    () => [
      { field: 'orderNumber', headerName: 'Mã đơn', width: 120 },
      {
        field: 'customer',
        headerName: 'Khách hàng',
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => row.customer.fullName,
      },
      {
        field: 'orderedAt',
        headerName: 'Ngày đặt',
        width: 160,
        valueFormatter: (value: string) => formatDateTime(value),
      },
      {
        field: 'totalAmount',
        headerName: 'Tổng tiền',
        type: 'number',
        width: 140,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'status',
        headerName: 'Trạng thái',
        width: 190,
        sortable: false,
        renderCell: ({ row }) => (
          <OrderStatusSelect
            orderCode={row.orderNumber}
            status={row.status}
            disabled={updatingId === row.id}
            onChange={(next) => handleStatusChange(row, next)}
          />
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 70,
        getActions: ({ row }) => [
          <GridActionsCellItem key="view" icon={<VisibilityIcon />} label="Xem chi tiết" onClick={() => setSelectedOrder(row)} />,
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatingId],
  )

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Quản lý đơn hàng
      </Typography>

      {orders.error && (
        <Alert severity="error" action={<Button onClick={orders.reload}>Thử lại</Button>}>
          {orders.error}
        </Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={orders.data ?? []}
          columns={columns}
          loading={orders.isLoading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
