import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useState } from 'react'
import { PAYMENT_METHOD_LABELS } from '@/features/orders/types'
import { PRODUCT_TYPE_LABELS } from '@/features/products/types'
import { formatCurrency } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminApi } from '../api/adminApi'
import { AreaChart } from '../components/charts/AreaChart'
import { BarList } from '../components/charts/BarList'
import { ColumnChart } from '../components/charts/ColumnChart'
import { DonutChart } from '../components/charts/DonutChart'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { CustomerAndGiftBoxPanels } from './CustomerAndGiftBoxPanels'
import { ANALYTICS_RANGES } from './types'

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function AnalyticsPage() {
  const [days, setDays] = useState<number>(30)
  const { data, error, isLoading, reload } = useAsync(() => adminApi.analytics(days), [days])

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Phân tích"
        subtitle="Doanh thu, sản phẩm và hành vi mua hàng"
        actions={
          <ToggleButtonGroup exclusive size="small" value={days} aria-label="Khoảng thời gian" onChange={(_e, next: number | null) => next && setDays(next)}>
            {ANALYTICS_RANGES.map((range) => <ToggleButton key={range} value={range}>{range} ngày</ToggleButton>)}
          </ToggleButtonGroup>
        }
      />
      {error && <Alert severity="error" action={<Button onClick={reload}>Thử lại</Button>}>{error}</Alert>}
      {isLoading && !data && <Skeleton variant="rounded" height={360} aria-label="Đang tải phân tích" />}
      {data && (
        <Grid container spacing={2} aria-busy={isLoading}>
          <Grid size={12}><Panel title={`Doanh thu ${data.days} ngày`}><AreaChart data={data.revenueByDay} /></Panel></Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Panel title="Doanh thu theo danh mục">
              <BarList data={data.revenueByCategory.map((c) => ({ label: c.name, value: c.revenue }))} formatValue={formatCurrency} />
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Panel title="Doanh thu theo loại sản phẩm">
              <DonutChart label="Doanh thu theo loại sản phẩm" formatValue={formatCurrency} data={data.revenueByProductType.map((t) => ({ label: PRODUCT_TYPE_LABELS[t.productType], value: t.revenue }))} />
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Panel title="Phương thức thanh toán">
              <DonutChart label="Đơn theo phương thức thanh toán" formatValue={(v) => `${v} đơn`} data={data.paymentMethods.map((m) => ({ label: PAYMENT_METHOD_LABELS[m.method], value: m.orders }))} />
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Panel title="Đơn theo thứ trong tuần">
              <ColumnChart label="Số đơn theo thứ trong tuần" data={data.ordersByWeekday.map((d) => ({ label: WEEKDAYS[d.weekday]!, value: d.orders }))} />
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Panel title="Top 10 sản phẩm">
              <BarList data={data.topProducts.map((p) => ({ label: p.name, value: p.revenue, hint: `${p.units} sản phẩm đã bán` }))} formatValue={formatCurrency} />
            </Panel>
          </Grid>
          <CustomerAndGiftBoxPanels data={data} />
        </Grid>
      )}
    </Stack>
  )
}
