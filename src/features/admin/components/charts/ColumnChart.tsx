import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface ColumnDatum {
  label: string
  value: number
}

/** Cột đứng đơn giản (vd. số đơn theo thứ trong tuần); cột cao nhất được tô đậm. */
export function ColumnChart({ data, label }: { data: ColumnDatum[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  return (
    <Box role="img" aria-label={label} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 140 }}>
      {data.map((d) => (
        <Box key={d.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.value}</Typography>
          <Box sx={{ width: '100%', maxWidth: 36, height: `${max === 0 ? 2 : Math.max((d.value / max) * 100, 2)}%`, minHeight: 3, borderRadius: '8px 8px 2px 2px', bgcolor: d.value === max && max > 0 ? 'primary.main' : 'action.selected', transition: 'height .5s cubic-bezier(.22,1,.36,1)' }} />
          <Typography variant="caption" color="text.secondary">{d.label}</Typography>
        </Box>
      ))}
    </Box>
  )
}
