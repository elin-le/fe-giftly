import AttachMoney from '@mui/icons-material/AttachMoney'
import CardGiftcard from '@mui/icons-material/CardGiftcard'
import Groups from '@mui/icons-material/Groups'
import ReceiptLong from '@mui/icons-material/ReceiptLong'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { formatCurrency } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/features/orders/types'
import { adminApi } from '../api/adminApi'
import { BarList } from '../components/charts/BarList'
import { AreaChart } from '../components/charts/AreaChart'
import { DonutChart } from '../components/charts/DonutChart'
import { KpiCard } from '../components/KpiCard'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { AttentionStrip } from './AttentionStrip'
import { LowStockList } from './LowStockList'
import { RecentOrders } from './RecentOrders'

export function DashboardPage() {
  const { data, error, isLoading, reload } = useAsync(() => adminApi.dashboard(), [])

  if (error) return <Alert severity="error" action={<Button onClick={reload}>Thử lại</Button>}>{error}</Alert>
  if (isLoading || !data) return <Skeleton variant="rounded" height={360} aria-label="Đang tải Dashboard" />

  const { kpis } = data
  return (
    <Stack spacing={3}>
      <PageHeader title="Tổng quan" subtitle="Hoạt động cửa hàng trong 30 ngày gần nhất" />
      <AttentionStrip pendingOrders={kpis.pendingOrders} pendingGiftBoxRequests={kpis.pendingGiftBoxRequests} lowStockVariants={kpis.lowStockVariants} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard label="Doanh thu" value={formatCurrency(kpis.revenue)} icon={<AttachMoney />} current={kpis.revenue} previous={kpis.previousRevenue} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard label="Đơn hàng" value={String(kpis.orders)} icon={<ReceiptLong />} tone="info" current={kpis.orders} previous={kpis.previousOrders} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard label="Giá trị đơn trung bình" value={formatCurrency(kpis.averageOrderValue)} icon={<CardGiftcard />} tone="warning" hint="Không tính đơn huỷ/trả" /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard label="Khách hàng" value={String(kpis.customers)} icon={<Groups />} tone="success" hint={`${kpis.newCustomers} khách mới trong kỳ`} /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}><Panel title="Doanh thu theo ngày"><AreaChart data={data.revenueByDay} /></Panel></Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Panel title="Trạng thái đơn hàng">
            <DonutChart label="Tỷ lệ đơn theo trạng thái" data={data.statusBreakdown.map((s) => ({ label: ORDER_STATUS_LABELS[s.status], value: s.count }))} />
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Panel title="Bán chạy nhất">
            <BarList data={data.topProducts.map((p) => ({ label: p.name, value: p.revenue, hint: `${p.units} sản phẩm` }))} formatValue={formatCurrency} />
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}><Panel title="Sắp hết hàng"><LowStockList items={data.lowStock} /></Panel></Grid>
        <Grid size={{ xs: 12, lg: 4 }}><Panel title="Đơn gần đây"><RecentOrders orders={data.recentOrders} /></Panel></Grid>
      </Grid>
    </Stack>
  )
}
