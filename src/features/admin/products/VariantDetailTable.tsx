import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatDimensions, formatWeight } from '@/features/gift-builder/fit'
import { getVariantAttributes } from '@/features/products/productRules'
import { PRODUCT_STATUS_LABELS, type Product, type ProductVariant } from '@/features/products/types'
import { Money } from '../components/Money'
import { StockChip } from '../components/StockChip'

const STATUS_COLORS = { AVAILABLE: 'success', OUT_OF_STOCK: 'warning', DISCONTINUED: 'default' } as const

function PolicyChips({ variant }: { variant: ProductVariant }) {
  const { policy } = variant
  if (!policy) return <Typography variant="body2" color="text.secondary">—</Typography>
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {policy.returnPolicy === 'NO_RETURN' && <Chip size="small" color="error" variant="outlined" label="Không đổi trả" />}
      {policy.advancePaymentPercent ? <Chip size="small" color="info" variant="outlined" label={`Cọc ${policy.advancePaymentPercent}%`} /> : null}
      {policy.isPerishable && <Chip size="small" color="warning" variant="outlined" label={`Dễ hỏng · ${policy.shelfLifeHours ?? '?'}h`} />}
      {variant.giftBoxDetail?.inner && <Chip size="small" variant="outlined" label={`Lòng ${formatDimensions(variant.giftBoxDetail.inner)}`} />}
      {variant.giftBoxDetail?.maxWeight && <Chip size="small" variant="outlined" label={`Tải ${formatWeight(variant.giftBoxDetail.maxWeight)}`} />}
    </Stack>
  )
}

/** Toàn bộ thuộc tính của từng biến thể: SKU, tuỳ chọn, giá, tồn kho, kích thước, khối lượng, chính sách, trạng thái. */
export function VariantDetailTable({ product }: { product: Product }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label={`Biến thể của ${product.name}`}>
        <TableHead>
          <TableRow>
            <TableCell>SKU</TableCell>
            <TableCell>Thuộc tính</TableCell>
            <TableCell align="right">Giá</TableCell>
            <TableCell align="center">Tồn kho</TableCell>
            <TableCell>Kích thước</TableCell>
            <TableCell>Khối lượng</TableCell>
            <TableCell>Chính sách</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {product.variants.map((variant) => {
            const attributes = Object.entries(getVariantAttributes(product, variant))
            return (
              <TableRow key={variant.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{variant.sku}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                    {attributes.length === 0 ? <Typography variant="body2" color="text.secondary">Mặc định</Typography> : attributes.map(([name, value]) => <Chip key={name} size="small" label={`${name}: ${value}`} />)}
                  </Stack>
                </TableCell>
                <TableCell align="right"><Money amount={variant.price} /></TableCell>
                <TableCell align="center"><StockChip quantity={variant.stockQuantity} /></TableCell>
                <TableCell>{variant.dimensions ? formatDimensions(variant.dimensions) : '—'}</TableCell>
                <TableCell>{variant.weight ? formatWeight(variant.weight) : '—'}</TableCell>
                <TableCell><PolicyChips variant={variant} /></TableCell>
                <TableCell><Chip size="small" color={STATUS_COLORS[variant.status]} label={PRODUCT_STATUS_LABELS[variant.status]} /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}
