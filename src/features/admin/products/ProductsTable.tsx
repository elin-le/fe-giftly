import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import type { Product } from '@/features/products/types'
import { PRODUCT_TABLE_COLUMNS, ProductRow } from './ProductRow'

const PAGE_SIZES = [10, 25, 50]

interface ProductsTableProps {
  products: Product[]
  categoryNames: ReadonlyMap<string, string>
  isLoading: boolean
  onEdit: (product: Product, tab?: 'variants') => void
  onDelete: (product: Product) => void
}

/** Bảng sản phẩm dạng cha–con: mỗi sản phẩm một hàng, bấm để xem các biến thể của nó. */
export function ProductsTable({ products, categoryNames, isLoading, onEdit, onDelete }: ProductsTableProps) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]!)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())

  // Lọc làm ít kết quả đi thì quay về trang hợp lệ.
  useEffect(() => {
    if (page > 0 && page * pageSize >= products.length) setPage(0)
  }, [products.length, page, pageSize])

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const visible = products.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table aria-label="Danh sách sản phẩm" aria-busy={isLoading}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="center">Biến thể</TableCell>
              <TableCell align="center">Tồn kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                categoryName={categoryNames.get(product.categoryId) ?? '—'}
                isOpen={openIds.has(product.id)}
                onToggle={() => toggle(product.id)}
                onEdit={(tab) => onEdit(product, tab)}
                onDelete={() => onDelete(product)}
              />
            ))}
            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={PRODUCT_TABLE_COLUMNS} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Không có sản phẩm phù hợp.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={products.length}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZES}
        labelRowsPerPage="Số dòng"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        onPageChange={(_event, next) => setPage(next)}
        onRowsPerPageChange={(event) => { setPageSize(Number(event.target.value)); setPage(0) }}
      />
    </Paper>
  )
}
