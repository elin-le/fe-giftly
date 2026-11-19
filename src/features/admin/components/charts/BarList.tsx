import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface BarDatum {
  label: string
  value: number
  hint?: string
}

/** Danh sách thanh ngang xếp hạng: độ dài theo giá trị lớn nhất, số in đậm bên phải. */
export function BarList({ data, formatValue, empty = 'Chưa có dữ liệu.' }: { data: BarDatum[]; formatValue: (value: number) => string; empty?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  if (data.length === 0) return <Typography color="text.secondary">{empty}</Typography>
  return (
    <Box component="ol" sx={{ m: 0, p: 0, display: 'grid', gap: 1.25 }}>
      {data.map((d, index) => (
        <Box component="li" key={d.label} sx={{ listStyle: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ minWidth: 0 }}><strong>{index + 1}.</strong> {d.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap' }}>{formatValue(d.value)}</Typography>
          </Box>
          <Box role="presentation" sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${max === 0 ? 0 : Math.max((d.value / max) * 100, 2)}%`, borderRadius: 4, bgcolor: 'primary.main', transition: 'width .5s cubic-bezier(.22,1,.36,1)' }} />
          </Box>
          {d.hint && <Typography variant="caption" color="text.secondary">{d.hint}</Typography>}
        </Box>
      ))}
    </Box>
  )
}
