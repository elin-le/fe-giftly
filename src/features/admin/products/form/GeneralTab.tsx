import Stack from '@mui/material/Stack'
import { useWatch } from 'react-hook-form'
import { PRODUCT_STATUS_LABELS, PRODUCT_TYPE_LABELS, type Category } from '@/features/products/types'
import { FormSelect, FormSwitch, FormTextField, toOptions } from './FormFields'

export function GeneralTab({ categories }: { categories: Category[] }) {
  const productType = useWatch({ name: 'productType' })
  return (
    <Stack spacing={2.5}>
      <FormTextField name="name" label="Tên sản phẩm" />
      <FormTextField name="description" label="Mô tả" multiline minRows={3} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
        <FormSelect name="categoryId" label="Danh mục" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        <FormSelect name="productType" label="Loại sản phẩm" options={toOptions(PRODUCT_TYPE_LABELS)} />
      </Stack>
      <FormSelect name="status" label="Trạng thái" options={toOptions(PRODUCT_STATUS_LABELS)} />
      {productType === 'REGULAR' && <FormSwitch name="isCustomBoxEligible" label="Cho phép đưa vào hộp quà tùy chỉnh" />}
    </Stack>
  )
}
