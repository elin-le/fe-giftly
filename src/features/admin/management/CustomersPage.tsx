import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { UserStatus } from '@/features/auth/types'
import { formatDateTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminApi } from '../api/adminApi'
import { DataTable } from '../components/DataTable'
import { Money } from '../components/Money'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { PageHeader } from '../components/PageHeader'
import { useAdminAction } from '../hooks/useAdminAction'
import { useNotice } from '../hooks/useNotice'
import { filterCustomers } from './customerRules'

export function CustomersPage() {
  const customers = useAsync(() => adminApi.customers(), [])
  const notice = useNotice()
  const { isBusy, run } = useAdminAction(notice, customers.reload)
  const [keyword, setKeyword] = useState('')
  const rows = filterCustomers(customers.data ?? [], keyword)

  const toggle = (id: string, status: UserStatus) =>
    run(() => adminApi.setCustomerStatus(id, status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'), status === 'ACTIVE' ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản')

  return (
    <Stack spacing={3}>
      <PageHeader title="Khách hàng" subtitle="Theo dõi mức chi tiêu và quản lý trạng thái tài khoản" />
      <TextField size="small" type="search" label="Tìm theo tên, email, số điện thoại" value={keyword} onChange={(e) => setKeyword(e.target.value)} sx={{ maxWidth: 420 }} />
      {customers.error && <Alert severity="error" action={<Button onClick={customers.reload}>Thử lại</Button>}>{customers.error}</Alert>}
      <DataTable
        label="Danh sách khách hàng"
        rows={rows}
        isLoading={customers.isLoading}
        getKey={(c) => c.id}
        columns={[
          { header: 'Khách hàng', render: (c) => <><Typography sx={{ fontWeight: 700 }}>{c.fullName}</Typography><Typography variant="body2" color="text.secondary">{c.email}</Typography></> },
          { header: 'Điện thoại', render: (c) => c.phone ?? '—' },
          { header: 'Số đơn', align: 'center', render: (c) => <Typography sx={{ fontWeight: 800 }}>{c.orderCount}</Typography> },
          { header: 'Tổng chi tiêu', align: 'right', render: (c) => <Money amount={c.totalSpent} /> },
          { header: 'Đơn gần nhất', render: (c) => (c.lastOrderAt ? formatDateTime(c.lastOrderAt) : '—') },
          { header: 'Trạng thái', render: (c) => <Chip size="small" color={c.status === 'ACTIVE' ? 'success' : 'default'} label={c.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khoá'} /> },
          { header: '', align: 'right', render: (c) => <Button size="small" color={c.status === 'ACTIVE' ? 'error' : 'primary'} disabled={isBusy} onClick={() => void toggle(c.id, c.status)} aria-label={`${c.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'} ${c.fullName}`}>{c.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}</Button> },
        ]}
      />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
