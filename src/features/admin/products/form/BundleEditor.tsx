import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { GROUP_PRODUCT_TYPES, ROLE_PRODUCT_TYPES } from '@/features/products/productInputRules'
import { COMPONENT_ROLE_LABELS, type ComponentRole, type OptionGroupType } from '@/features/products/types'
import type { ProductFormInput } from '../productFormSchema'
import { filterCandidates, type VariantCandidate } from './bundleCandidates'
import { FormSelect, FormSwitch, FormTextField, toOptions } from './FormFields'

const PRICING_LABELS = { FREE: 'Miễn phí', PRODUCT_PRICE: 'Theo giá bán', FIXED_PRICE: 'Giá cố định' }
const GROUP_TYPE_LABELS: Record<OptionGroupType, string> = { GREETING_CARD: 'Thiệp', PACKAGING_ACCESSORY: 'Phụ kiện đóng gói', OTHER: 'Khác' }
const SELECTION_LABELS = { SINGLE: 'Chọn một', MULTIPLE: 'Chọn nhiều' }

const asOptions = (candidates: VariantCandidate[]) => candidates.map((candidate) => ({ value: candidate.variantId, label: candidate.label }))

function Components({ variantIndex, candidates }: { variantIndex: number; candidates: VariantCandidate[] }) {
  const { control } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: `variants.${variantIndex}.components` })
  const rows = useWatch({ control, name: `variants.${variantIndex}.components` })
  const base = `variants.${variantIndex}.components`

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Thành phần cố định (đã gồm trong giá set)</Typography>
      {fields.map((field, index) => (
        <Stack key={field.id} spacing={1} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormSelect name={`${base}.${index}.componentRole`} label="Vai trò" options={toOptions(COMPONENT_ROLE_LABELS)} />
            <FormSelect
              name={`${base}.${index}.componentVariantId`}
              label="Sản phẩm"
              options={asOptions(filterCandidates(candidates, ROLE_PRODUCT_TYPES[(rows[index]?.componentRole ?? 'PRODUCT') as ComponentRole]))}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormTextField name={`${base}.${index}.quantity`} label="Số lượng" type="number" slotProps={{ htmlInput: { min: 1 } }} />
            <FormSwitch name={`${base}.${index}.isRequired`} label="Bắt buộc" />
            <IconButton aria-label={`Xoá thành phần ${index + 1}`} onClick={() => remove(index)} sx={{ ml: 'auto' }}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      ))}
      <Box>
        <Button size="small" startIcon={<AddIcon />} onClick={() => append({ componentVariantId: '', componentRole: 'PRODUCT', quantity: 1, isRequired: true })}>
          Thêm thành phần
        </Button>
      </Box>
    </Stack>
  )
}

function GroupOptions({ base, groupType, candidates }: { base: string; groupType: OptionGroupType; candidates: VariantCandidate[] }) {
  const { control } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: `${base}.options` as 'variants.0.optionGroups.0.options' })
  const rows = useWatch({ control, name: `${base}.options` as 'variants.0.optionGroups.0.options' })
  const allowed = asOptions(filterCandidates(candidates, GROUP_PRODUCT_TYPES[groupType]))

  return (
    <Stack spacing={1}>
      {fields.map((field, index) => (
        <Stack key={field.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
          <FormSelect name={`${base}.options.${index}.productVariantId`} label="Sản phẩm" options={allowed} />
          <FormSelect name={`${base}.options.${index}.pricingMode`} label="Cách tính giá" options={toOptions(PRICING_LABELS)} />
          {rows[index]?.pricingMode === 'FIXED_PRICE' && <FormTextField name={`${base}.options.${index}.fixedPrice`} label="Giá cố định (₫)" type="number" />}
          <IconButton aria-label={`Xoá lựa chọn ${index + 1}`} onClick={() => remove(index)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Box>
        <Button size="small" startIcon={<AddIcon />} onClick={() => append({ productVariantId: '', pricingMode: 'FREE', fixedPrice: '' })}>
          Thêm lựa chọn
        </Button>
      </Box>
    </Stack>
  )
}

function OptionGroups({ variantIndex, candidates }: { variantIndex: number; candidates: VariantCandidate[] }) {
  const { control } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: `variants.${variantIndex}.optionGroups` })
  const groups = useWatch({ control, name: `variants.${variantIndex}.optionGroups` })

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Nhóm tuỳ chọn khách được chọn (thiệp, phụ kiện…)</Typography>
      {fields.map((field, index) => {
        const base = `variants.${variantIndex}.optionGroups.${index}`
        return (
          <Stack key={field.id} spacing={1.5} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <FormTextField name={`${base}.name`} label="Tên nhóm" />
              <IconButton aria-label={`Xoá nhóm ${groups[index]?.name || index + 1}`} onClick={() => remove(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormSelect name={`${base}.groupType`} label="Loại nhóm" options={toOptions(GROUP_TYPE_LABELS)} />
              <FormSelect name={`${base}.selectionType`} label="Kiểu chọn" options={toOptions(SELECTION_LABELS)} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <FormTextField name={`${base}.minSelections`} label="Tối thiểu" type="number" slotProps={{ htmlInput: { min: 0 } }} />
              <FormTextField name={`${base}.maxSelections`} label="Tối đa" type="number" slotProps={{ htmlInput: { min: 1 } }} />
              <FormSwitch name={`${base}.isRequired`} label="Bắt buộc" />
            </Stack>
            <GroupOptions base={base} groupType={(groups[index]?.groupType ?? 'OTHER') as OptionGroupType} candidates={candidates} />
          </Stack>
        )
      })}
      <Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            append({ name: '', groupType: 'GREETING_CARD', selectionType: 'SINGLE', minSelections: '', maxSelections: '1', isRequired: false, options: [{ productVariantId: '', pricingMode: 'FREE', fixedPrice: '' }] })
          }
        >
          Thêm nhóm tuỳ chọn
        </Button>
      </Box>
    </Stack>
  )
}

/** Thành phần cố định và nhóm tuỳ chọn của một biến thể set quà. */
export function BundleEditor({ variantIndex, candidates }: { variantIndex: number; candidates: VariantCandidate[] }) {
  return (
    <Stack spacing={2.5}>
      <Components variantIndex={variantIndex} candidates={candidates} />
      <OptionGroups variantIndex={variantIndex} candidates={candidates} />
    </Stack>
  )
}
