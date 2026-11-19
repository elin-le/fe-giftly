import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useMemo, useState } from 'react'
import { toApiError } from '@/api/errors'
import { productsApi } from '@/features/products/api/productsApi'
import { useCategories, useProducts } from '@/features/products/hooks/useProducts'
import type { Product, ProductInput } from '@/features/products/types'
import { NoticeSnackbar } from '../components/NoticeSnackbar'
import { PageHeader } from '../components/PageHeader'
import { useNotice } from '../hooks/useNotice'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductToolbar } from './ProductToolbar'
import { ProductsTable } from './ProductsTable'
import { EMPTY_FILTER, filterProducts, type ProductFilter } from './productTableRules'

type FormTarget = { mode: 'create' } | { mode: 'edit'; product: Product; tab?: 'variants' } | null

export function AdminProductsPage() {
  const products = useProducts({})
  const categories = useCategories()
  const notice = useNotice()

  const [filter, setFilter] = useState<ProductFilter>(EMPTY_FILTER)
  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const categoryNames = useMemo(() => new Map((categories.data ?? []).map((category) => [category.id, category.name])), [categories.data])
  const filtered = useMemo(() => filterProducts(products.data ?? [], filter), [products.data, filter])

  /** Chạy một thao tác ghi dữ liệu: bật cờ bận, báo kết quả, tải lại bảng. */
  const runMutation = async (action: () => Promise<unknown>, successMessage: string): Promise<boolean> => {
    setIsBusy(true)
    try {
      await action()
      notice.success(successMessage)
      products.reload()
      return true
    } catch (error) {
      notice.error(toApiError(error).message)
      return false
    } finally {
      setIsBusy(false)
    }
  }

  const handleSave = async (input: ProductInput) => {
    if (!formTarget) return
    const target = formTarget
    const saved = await runMutation(
      () => (target.mode === 'edit' ? productsApi.update(target.product.id, input) : productsApi.create(input)),
      target.mode === 'edit' ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm',
    )
    if (saved) setFormTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    const deleted = await runMutation(() => productsApi.remove(target.id), 'Đã xoá sản phẩm')
    if (deleted) setDeleteTarget(null)
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Quản lý sản phẩm" subtitle={`${products.data?.length ?? 0} sản phẩm · bấm vào một sản phẩm để xem các biến thể`} />
      <ProductToolbar filter={filter} categories={categories.data ?? []} onChange={setFilter} onCreate={() => setFormTarget({ mode: 'create' })} />

      {products.error && (
        <Alert severity="error" action={<Button onClick={products.reload}>Thử lại</Button>}>
          {products.error}
        </Alert>
      )}

      <ProductsTable
        products={filtered}
        categoryNames={categoryNames}
        isLoading={products.isLoading}
        onEdit={(product, tab) => setFormTarget({ mode: 'edit', product, tab })}
        onDelete={setDeleteTarget}
      />

      <ProductFormDialog
        open={formTarget !== null}
        product={formTarget?.mode === 'edit' ? formTarget.product : undefined}
        initialTab={formTarget?.mode === 'edit' ? formTarget.tab : undefined}
        categories={categories.data ?? []}
        products={products.data ?? []}
        isSaving={isBusy}
        onSubmit={handleSave}
        onClose={() => setFormTarget(null)}
      />
      <ConfirmDeleteDialog productName={deleteTarget?.name ?? null} isDeleting={isBusy} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <NoticeSnackbar notice={notice.notice} onClose={notice.dismiss} />
    </Stack>
  )
}
