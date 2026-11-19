import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { getPriceRange, getThumbnailUrl, getTotalStock } from '@/features/products/productRules'
import { PRODUCT_STATUS_LABELS, PRODUCT_TYPE_LABELS, type Product } from '@/features/products/types'
import { formatCurrency } from '@/lib/format'
import { Money } from '../components/Money'
import { StockChip } from '../components/StockChip'
import { countLowStockVariants } from './productTableRules'
import { VariantDetailTable } from './VariantDetailTable'

const STATUS_COLORS = { AVAILABLE: 'success', OUT_OF_STOCK: 'warning', DISCONTINUED: 'default' } as const
export const PRODUCT_TABLE_COLUMNS = 8

interface ProductRowProps {
  product: Product
  index: number
  categoryName: string
  isOpen: boolean
  onToggle: () => void
  onEdit: (tab?: 'variants') => void
  onDelete: () => void
}

/** Một sản phẩm (hàng cha); bấm để mở các biến thể. Màu nền xen kẽ theo `index` để dễ dò hàng. */
export function ProductRow({ product, index, categoryName, isOpen, onToggle, onEdit, onDelete }: ProductRowProps) {
  const range = getPriceRange(product)
  const thumbnail = getThumbnailUrl(product)
  const lowStock = countLowStockVariants(product.variants)

  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        aria-expanded={isOpen}
        sx={{ cursor: 'pointer', bgcolor: isOpen ? 'row.expanded' : index % 2 ? 'row.zebra' : 'transparent', '&:hover': { bgcolor: 'row.hover' }, '& > td': { borderBottom: isOpen ? 0 : undefined } }}
      >
        <TableCell padding="checkbox">
          <IconButton size="small" aria-label={isOpen ? `Thu gọn ${product.name}` : `Xem biến thể của ${product.name}`} sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <ExpandMoreIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
            <Box component="img" src={thumbnail} alt="" sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover', bgcolor: 'action.hover', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} noWrap>{product.name}</Typography>
              <Typography variant="caption" color="text.secondary">{PRODUCT_TYPE_LABELS[product.productType]}</Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>{categoryName}</TableCell>
        <TableCell align="right">
          {range ? range.min === range.max ? <Money amount={range.min} /> : <Money amount={range.min} title={`${formatCurrency(range.min)} – ${formatCurrency(range.max)}`} /> : '—'}
          {range && range.min !== range.max && <Typography variant="caption" color="text.secondary" component="div">đến {formatCurrency(range.max)}</Typography>}
        </TableCell>
        <TableCell align="center"><Chip size="small" color="primary" variant="outlined" label={`${product.variants.length} biến thể`} /></TableCell>
        <TableCell align="center">
          <StockChip quantity={getTotalStock(product)} />
          {lowStock > 0 && <Typography variant="caption" color="warning.main" component="div" sx={{ fontWeight: 700 }}>{lowStock} sắp hết</Typography>}
        </TableCell>
        <TableCell><Chip size="small" color={STATUS_COLORS[product.status]} label={PRODUCT_STATUS_LABELS[product.status]} /></TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={(event) => event.stopPropagation()}>
          <Tooltip title="Sửa"><IconButton aria-label={`Sửa ${product.name}`} onClick={() => onEdit()}><EditIcon /></IconButton></Tooltip>
          <Tooltip title="Xoá"><IconButton aria-label={`Xoá ${product.name}`} color="error" onClick={onDelete}><DeleteIcon /></IconButton></Tooltip>
        </TableCell>
      </TableRow>
      <TableRow sx={{ bgcolor: 'row.expanded' }}>
        <TableCell colSpan={PRODUCT_TABLE_COLUMNS} sx={{ py: 0, borderBottom: isOpen ? undefined : 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: { md: 6 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Biến thể ({product.variants.length})</Typography>
                <Chip clickable size="small" color="primary" label="Chỉnh sửa biến thể" onClick={() => onEdit('variants')} />
              </Box>
              <VariantDetailTable product={product} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
