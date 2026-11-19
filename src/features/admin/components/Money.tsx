import Typography, { type TypographyProps } from '@mui/material/Typography'
import { formatCurrency } from '@/lib/format'

/** Số tiền in đậm, màu nhấn để dễ dò theo cột. */
export function Money({ amount, ...props }: { amount: number } & Omit<TypographyProps, 'children'>) {
  return (
    <Typography component="span" {...props} sx={{ fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap', ...props.sx }}>
      {formatCurrency(amount)}
    </Typography>
  )
}
