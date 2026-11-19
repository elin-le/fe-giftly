import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUSES, PRODUCT_TYPES, PRODUCT_TYPE_LABELS, type Category } from '@/features/products/types'
import type { ProductFilter } from './productTableRules'

interface ProductToolbarProps {
  filter: ProductFilter
  categories: Category[]
  onChange: (filter: ProductFilter) => void
  onCreate: () => void
}

export function ProductToolbar({ filter, categories, onChange, onCreate }: ProductToolbarProps) {
  const set = <K extends keyof ProductFilter>(key: K, value: ProductFilter[K]) => onChange({ ...filter, [key]: value })
  const select = (label: string, key: 'categoryId' | 'productType' | 'status', options: Array<[string, string]>) => (
    <TextField select size="small" label={label} value={filter[key]} onChange={(e) => set(key, e.target.value as never)} sx={{ minWidth: 150 }}>
      <MenuItem value="">Tất cả</MenuItem>
      {options.map(([value, text]) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
    </TextField>
  )

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
      <TextField
        size="small"
        label="Tìm tên, SKU, thuộc tính"
        value={filter.search}
        onChange={(e) => set('search', e.target.value)}
        sx={{ flex: 1, minWidth: 220 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
      />
      {select('Danh mục', 'categoryId', categories.map((c) => [c.id, c.name]))}
      {select('Loại', 'productType', PRODUCT_TYPES.map((t) => [t, PRODUCT_TYPE_LABELS[t]]))}
      {select('Trạng thái', 'status', PRODUCT_STATUSES.map((s) => [s, PRODUCT_STATUS_LABELS[s]]))}
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>Thêm sản phẩm</Button>
    </Stack>
  )
}
