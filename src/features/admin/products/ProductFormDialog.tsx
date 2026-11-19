import { zodResolver } from '@hookform/resolvers/zod'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Category, Product, ProductInput } from '@/features/products/types'
import { buildVariantCandidates } from './form/bundleCandidates'
import { GeneralTab } from './form/GeneralTab'
import { ImagesTab } from './form/ImagesTab'
import { OptionsTab } from './form/OptionsTab'
import { VariantsTab } from './form/VariantsTab'
import { productFormSchema, toFormValues, toProductInput, type ProductFormInput, type ProductFormValues } from './productFormSchema'

const TABS = [
  { id: 'general', label: 'Thông tin', fields: ['name', 'description', 'categoryId', 'productType', 'status', 'isCustomBoxEligible'] },
  { id: 'images', label: 'Ảnh', fields: ['images'] },
  { id: 'options', label: 'Tuỳ chọn', fields: ['options'] },
  { id: 'variants', label: 'Biến thể', fields: ['variants'] },
] as const

type TabId = (typeof TABS)[number]['id']

interface ProductFormDialogProps {
  open: boolean
  /** Thẻ mở sẵn khi vào chế độ sửa (mặc định: Thông tin). */
  initialTab?: TabId
  /** Có giá trị → chế độ sửa; undefined → chế độ tạo mới. */
  product?: Product
  categories: Category[]
  /** Toàn bộ sản phẩm, để chọn thành phần/lựa chọn cho set quà. */
  products?: Product[]
  isSaving: boolean
  onSubmit: (input: ProductInput) => void
  onClose: () => void
}

export function ProductFormDialog({ open, product, initialTab, categories, products = [], isSaving, onSubmit, onClose }: ProductFormDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [tab, setTab] = useState<TabId>('general')

  const methods = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  })
  const { handleSubmit, reset, formState } = methods

  // Nạp lại dữ liệu mỗi lần mở dialog (tạo mới hoặc sửa sản phẩm khác)
  useEffect(() => {
    if (open) {
      reset(toFormValues(product))
      setTab(initialTab ?? 'general')
    }
  }, [open, product, initialTab, reset])

  const candidates = useMemo(() => buildVariantCandidates(products, product?.id), [products, product?.id])
  const tabHasError = (fields: readonly string[]) => fields.some((field) => field in formState.errors)

  const submit = handleSubmit(
    (values) => onSubmit(toProductInput(values)),
    // Chuyển tới thẻ đầu tiên có lỗi để người dùng thấy ngay.
    (errors) => setTab(TABS.find((candidate) => candidate.fields.some((field) => field in errors))?.id ?? 'general'),
  )

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="md" fullScreen={isMobile}>
      <FormProvider {...methods}>
        <form onSubmit={submit} noValidate>
          <DialogTitle>{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <Tabs value={tab} onChange={(_event, next: TabId) => setTab(next)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
            {TABS.map(({ id, label, fields }) => (
              <Tab
                key={id}
                value={id}
                label={
                  <Badge color="error" variant="dot" invisible={!tabHasError(fields)} sx={{ '& .MuiBadge-badge': { right: -8 } }}>
                    {label}
                  </Badge>
                }
              />
            ))}
          </Tabs>
          <DialogContent sx={{ pt: 3 }}>
            {tab === 'general' && <GeneralTab categories={categories} />}
            {tab === 'images' && <ImagesTab />}
            {tab === 'options' && <OptionsTab />}
            {tab === 'variants' && <VariantsTab candidates={candidates} />}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isSaving}>
              Huỷ
            </Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  )
}
