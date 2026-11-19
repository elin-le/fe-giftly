import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { percentChange } from './charts/chartMath'

interface KpiCardProps {
  label: string
  value: string
  icon: ReactNode
  /** Màu nhấn của biểu tượng (khoá palette MUI). */
  tone?: 'primary' | 'warning' | 'info' | 'success' | 'error'
  /** So với kỳ trước: truyền cả hai để hiện % tăng/giảm. */
  current?: number
  previous?: number
  hint?: string
}

export function KpiCard({ label, value, icon, tone = 'primary', current, previous, hint }: KpiCardProps) {
  const change = current !== undefined && previous !== undefined ? percentChange(current, previous) : null
  return (
    <Paper variant="outlined" sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
      <Box aria-hidden sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 3, display: 'grid', placeItems: 'center', color: `${tone}.contrastText`, bgcolor: `${tone}.main` }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }} noWrap>{value}</Typography>
        {change !== null ? (
          <Chip size="small" color={change >= 0 ? 'success' : 'error'} icon={change >= 0 ? <ArrowUpward /> : <ArrowDownward />} label={`${Math.abs(change)}% so với kỳ trước`} sx={{ mt: 0.5, fontWeight: 700 }} />
        ) : hint ? (
          <Typography variant="caption" color="text.secondary">{hint}</Typography>
        ) : null}
      </Box>
    </Paper>
  )
}
