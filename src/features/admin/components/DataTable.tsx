import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  label: string
  rows: readonly T[]
  columns: readonly Column<T>[]
  getKey: (row: T) => string
  isLoading?: boolean
  empty?: string
  /** Hàng cần làm nổi bật (vd. đang chờ xử lý). */
  isHighlighted?: (row: T) => boolean
}

/** Bảng quản trị gọn: hàng xen kẽ màu, rê chuột đổi màu, hàng quan trọng có viền nhấn bên trái. */
export function DataTable<T>({ label, rows, columns, getKey, isLoading = false, empty = 'Chưa có dữ liệu.', isHighlighted }: DataTableProps<T>) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table aria-label={label} aria-busy={isLoading}>
          <TableHead>
            <TableRow>{columns.map((c) => <TableCell key={c.header} align={c.align}>{c.header}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={getKey(row)}
                hover
                sx={{ bgcolor: index % 2 ? 'row.zebra' : 'transparent', '&:hover': { bgcolor: 'row.hover' }, ...(isHighlighted?.(row) && { boxShadow: (t) => `inset 4px 0 0 ${t.palette.warning.main}` }) }}
              >
                {columns.map((c) => <TableCell key={c.header} align={c.align}>{c.render(row)}</TableCell>)}
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}><Typography color="text.secondary">{empty}</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
