import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DonutChart } from '../components/charts/DonutChart'
import { Panel } from '../components/Panel'
import type { AnalyticsStats } from './types'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{value}</Typography>
    </div>
  )
}

/** Khách mới/quay lại, tỷ lệ huỷ và tình hình hộp quà tùy chỉnh. */
export function CustomerAndGiftBoxPanels({ data }: { data: AnalyticsStats }) {
  const { customers, giftBoxes } = data
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Panel title="Khách hàng & huỷ đơn">
          <DonutChart label="Khách mới và khách quay lại" data={[{ label: 'Khách mới', value: customers.newCustomers }, { label: 'Khách quay lại', value: customers.returningCustomers }]} />
          <Stat label="Tỷ lệ huỷ đơn" value={`${Math.round(data.cancellationRate * 100)}%`} />
        </Panel>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Panel title="Hộp quà tùy chỉnh">
          <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
            <Stat label="Tổng số hộp" value={giftBoxes.total} />
            <Stat label="Chờ duyệt" value={giftBoxes.pendingReview} />
            <Stat label="Đã duyệt" value={giftBoxes.approved} />
            <Stat label="Cần chỉnh lại" value={giftBoxes.rejected} />
          </Stack>
        </Panel>
      </Grid>
    </>
  )
}
