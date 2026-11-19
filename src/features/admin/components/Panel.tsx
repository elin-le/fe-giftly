import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

/** Khung có tiêu đề cho từng khối trong Dashboard/Analytics. */
export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }} component="section" aria-label={title}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800 }}>{title}</Typography>
        {action}
      </div>
      {children}
    </Paper>
  )
}
