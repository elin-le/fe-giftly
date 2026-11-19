import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useCategories, useProducts } from '@/features/products/hooks/useProducts'
import type { Category } from '@/features/products/types'
import { adminApi } from '../api/adminApi'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { PageHeader } from '../components/PageHeader'
import { useAdminAction } from '../hooks/useAdminAction'
import { useNotice } from '../hooks/useNotice'
import { CategoryFormDialog } from './CategoryFormDialog'
import type { CategoryInput } from './types'

type FormTarget = { mode: 'create' } | { mode: 'edit'; category: Category } | null

export function CategoriesPage() {
  const categories = useCategories()
  const products = useProducts({})
  const notice = useNotice()
  const { isBusy, run } = useAdminAction(notice, categories.reload)
  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const countOf = (id: string) => (products.data ?? []).filter((p) => p.categoryId === id).length

  const save = async (input: CategoryInput) => {
    const target = formTarget
    if (!target) return
    const ok = await run(() => (target.mode === 'edit' ? adminApi.updateCategory(target.category.id, input) : adminApi.createCategory(input)), target.mode === 'edit' ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục')
    if (ok) setFormTarget(null)
  }

  const remove = async () => {
    const target = deleteTarget
    if (!target) return
    if (await run(() => adminApi.deleteCategory(target.id), 'Đã xoá danh mục')) setDeleteTarget(null)
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Danh mục" subtitle="Nhóm sản phẩm hiển thị ở trang chủ và bộ lọc cửa hàng" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormTarget({ mode: 'create' })}>Thêm danh mục</Button>} />
      {categories.error && <Alert severity="error" action={<Button onClick={categories.reload}>Thử lại</Button>}>{categories.error}</Alert>}
      <DataTable
        label="Danh sách danh mục"
        rows={categories.data ?? []}
        isLoading={categories.isLoading}
        getKey={(c) => c.id}
        columns={[
          { header: 'Tên danh mục', render: (c) => <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography> },
          { header: 'Mô tả', render: (c) => c.description ?? '—' },
          { header: 'Sản phẩm', align: 'center', render: (c) => <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{countOf(c.id)}</Typography> },
          { header: '', align: 'right', render: (c) => (
            <>
              <IconButton aria-label={`Sửa ${c.name}`} onClick={() => setFormTarget({ mode: 'edit', category: c })}><EditIcon /></IconButton>
              <IconButton aria-label={`Xoá ${c.name}`} color="error" onClick={() => setDeleteTarget(c)}><DeleteIcon /></IconButton>
            </>
          ) },
        ]}
      />
      <CategoryFormDialog open={formTarget !== null} category={formTarget?.mode === 'edit' ? formTarget.category : undefined} others={(categories.data ?? []).filter((c) => formTarget?.mode !== 'edit' || c.id !== formTarget.category.id)} isSaving={isBusy} onSubmit={save} onClose={() => setFormTarget(null)} />
      <ConfirmDialog open={deleteTarget !== null} title="Xoá danh mục?" message={`Danh mục “${deleteTarget?.name ?? ''}” sẽ bị xoá. Danh mục đang có sản phẩm không thể xoá.`} confirmLabel="Xoá" isBusy={isBusy} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
