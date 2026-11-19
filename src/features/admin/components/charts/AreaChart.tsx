import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { useId, useState } from 'react'
import type { DailyPoint } from '../../analytics/types'
import { formatCurrency } from '@/lib/format'
import { compactCurrency, toAreaPath, toLinePath, toPoints } from './chartMath'

const WIDTH = 640
const HEIGHT = 220
const PADDING = 12

/** Biểu đồ vùng doanh thu theo ngày; rê chuột/chạm để xem từng ngày. */
export function AreaChart({ data }: { data: DailyPoint[] }) {
  const { palette } = useTheme()
  const gradientId = useId()
  const [hover, setHover] = useState<number | null>(null)
  const points = toPoints(data.map((d) => d.revenue), WIDTH, HEIGHT, PADDING)
  const max = Math.max(...data.map((d) => d.revenue), 0)
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const active = hover !== null ? data[hover] : undefined
  const activePoint = hover !== null ? points[hover] : undefined

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12, mb: 0.5, minHeight: 20 }}>
        <span>{active ? `${active.date} · ${active.orders} đơn` : `Cao nhất ${compactCurrency(max)}`}</span>
        <strong style={{ color: palette.primary.main }}>{active ? formatCurrency(active.revenue) : formatCurrency(total)}</strong>
      </Box>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Doanh thu ${data.length} ngày, tổng ${formatCurrency(total)}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.primary.main} stopOpacity="0.35" />
            <stop offset="1" stopColor={palette.primary.main} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1={PADDING} x2={WIDTH - PADDING} y1={PADDING + (HEIGHT - PADDING * 2) * ratio} y2={PADDING + (HEIGHT - PADDING * 2) * ratio} stroke={palette.divider} strokeDasharray="4 6" />
        ))}
        <path d={toAreaPath(points, HEIGHT, PADDING)} fill={`url(#${gradientId})`} />
        <path d={toLinePath(points)} fill="none" stroke={palette.primary.main} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <rect key={data[index]!.date} x={point.x - WIDTH / data.length / 2} y={0} width={WIDTH / data.length} height={HEIGHT} fill="transparent" onMouseEnter={() => setHover(index)} onTouchStart={() => setHover(index)} />
        ))}
        {activePoint && <circle cx={activePoint.x} cy={activePoint.y} r={5} fill={palette.background.paper} stroke={palette.primary.main} strokeWidth={3} />}
      </svg>
    </Box>
  )
}
