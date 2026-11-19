import Chip from '@mui/material/Chip'
import { getStockLevel } from '../products/productTableRules'

const COLORS = { out: 'error', low: 'warning', ok: 'success' } as const

/** Tồn kho theo màu: đỏ = hết, cam = sắp hết, xanh = đủ. */
export function StockChip({ quantity }: { quantity: number }) {
  const level = getStockLevel(quantity)
  return <Chip size="small" variant={level === 'ok' ? 'outlined' : 'filled'} color={COLORS[level]} label={quantity <= 0 ? 'Hết hàng' : quantity} sx={{ fontWeight: 700, minWidth: 56 }} />
}
