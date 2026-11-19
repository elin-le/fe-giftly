import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { LowStockVariant } from '../analytics/types'
import { StockChip } from '../components/StockChip'

export function LowStockList({ items }: { items: LowStockVariant[] }) {
  if (items.length === 0) return <Typography color="text.secondary">Kho hàng đang ổn.</Typography>
  return (
    <Box component="ul" sx={{ m: 0, p: 0, display: 'grid', gap: 1 }}>
      {items.map((item) => (
        <Box component="li" key={item.variantId} sx={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{item.productName}{item.label ? ` · ${item.label}` : ''}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{item.sku}</Typography>
          </Box>
          <StockChip quantity={item.stockQuantity} />
        </Box>
      ))}
    </Box>
  )
}
