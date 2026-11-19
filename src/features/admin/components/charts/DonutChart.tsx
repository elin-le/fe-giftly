import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { toSlices } from './chartMath'
import { useChartColors } from './useChartColors'

export interface DonutDatum {
  label: string
  value: number
}

const SIZE = 160
const RADIUS = 60
const STROKE = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Biểu đồ tròn rỗng giữa kèm chú giải (nhãn + giá trị); không có dữ liệu thì báo trống. */
export function DonutChart({ data, formatValue = String, label }: { data: DonutDatum[]; formatValue?: (value: number) => string; label: string }) {
  const colors = useChartColors()
  const slices = toSlices(data.map((d) => d.value))
  if (slices.length === 0) return <Typography color="text.secondary">Chưa có dữ liệu.</Typography>

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} width={SIZE} height={SIZE} style={{ flexShrink: 0 }}>
        {slices.map((slice, index) => {
          const length = ((slice.end - slice.start) / 360) * CIRCUMFERENCE
          return (
            <circle
              key={data[index]!.label}
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={colors[index % colors.length]} strokeWidth={STROKE}
              strokeDasharray={`${Math.max(length - 2, 0)} ${CIRCUMFERENCE}`}
              transform={`rotate(${slice.start - 90} ${SIZE / 2} ${SIZE / 2})`}
            />
          )
        })}
      </svg>
      <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1, width: '100%' }} component="ul" aria-label={`Chú giải ${label}`}>
        {data.map((d, index) => (
          <Box component="li" key={d.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, listStyle: 'none' }}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, bgcolor: colors[index % colors.length] }} />
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>{d.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatValue(d.value)}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
