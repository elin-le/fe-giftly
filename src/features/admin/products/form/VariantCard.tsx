import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatCurrency } from '@/lib/format'
import {
  DIMENSION_UNITS,
  PRODUCT_STATUS_LABELS,
  RETURN_POLICY_LABELS,
  WEIGHT_UNITS,
  type ProductType,
} from '@/features/products/types'
import type { ProductFormInput } from '../productFormSchema'
import { BundleEditor } from './BundleEditor'
import type { VariantCandidate } from './bundleCandidates'
import { FormSelect, FormSwitch, FormTextField, toOptions } from './FormFields'

const units = <T extends string>(list: readonly T[]) => list.map((unit) => ({ value: unit, label: unit.toLowerCase() }))

function SizeFields({ base }: { base: string }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Kích thước và khối lượng</Typography>
      <Stack direction="row" useFlexGap spacing={1} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <FormTextField name={`${base}.length`} label="Dài" type="number" sx={{ flex: '1 1 80px' }} />
        <FormTextField name={`${base}.width`} label="Rộng" type="number" sx={{ flex: '1 1 80px' }} />
        <FormTextField name={`${base}.height`} label="Cao" type="number" sx={{ flex: '1 1 80px' }} />
        <FormSelect name={`${base}.dimensionUnit`} label="Đơn vị" options={units(DIMENSION_UNITS)} sx={{ minWidth: 90 }} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <FormTextField name={`${base}.weightValue`} label="Khối lượng" type="number" sx={{ flex: '1 1 140px' }} />
        <FormSelect name={`${base}.weightUnit`} label="Đơn vị" options={units(WEIGHT_UNITS)} sx={{ minWidth: 90 }} />
      </Stack>
    </Stack>
  )
}

function PolicyFields({ base, index }: { base: string; index: number }) {
  const { control } = useFormContext<ProductFormInput>()
  const hasPolicy = useWatch({ control, name: `variants.${index}.hasPolicy` })
  const isPerishable = useWatch({ control, name: `variants.${index}.isPerishable` })
  return (
    <Stack spacing={1.5}>
      <FormSwitch name={`${base}.hasPolicy`} label="Có chính sách đổi trả / đặt cọc / hạn dùng" />
      {hasPolicy && (
        <>
          <FormSwitch name={`${base}.isPerishable`} label="Hàng dễ hỏng" />
          {isPerishable && (
            <Typography variant="caption" color="text.secondary">
              Hàng dễ hỏng bắt buộc không đổi trả và đặt cọc tối thiểu 50% (ràng buộc của DB).
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
            <FormSelect name={`${base}.returnPolicy`} label="Đổi trả" emptyLabel="Chưa quy định" options={toOptions(RETURN_POLICY_LABELS)} />
            <FormTextField name={`${base}.advancePaymentPercent`} label="Đặt cọc (%)" type="number" slotProps={{ htmlInput: { min: 0, max: 100 } }} />
            <FormTextField name={`${base}.shelfLifeHours`} label="Hạn dùng (giờ)" type="number" slotProps={{ htmlInput: { min: 1 } }} />
          </Stack>
        </>
      )}
    </Stack>
  )
}

function GiftBoxFields({ base }: { base: string }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Lòng hộp và tải trọng (dùng để kiểm tra khi tự thiết kế hộp)</Typography>
      <Stack direction="row" useFlexGap spacing={1} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <FormTextField name={`${base}.innerLength`} label="Dài" type="number" sx={{ flex: '1 1 80px' }} />
        <FormTextField name={`${base}.innerWidth`} label="Rộng" type="number" sx={{ flex: '1 1 80px' }} />
        <FormTextField name={`${base}.innerHeight`} label="Cao" type="number" sx={{ flex: '1 1 80px' }} />
        <FormSelect name={`${base}.innerUnit`} label="Đơn vị" options={units(DIMENSION_UNITS)} sx={{ minWidth: 90 }} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <FormTextField name={`${base}.maxWeightValue`} label="Tải trọng tối đa" type="number" sx={{ flex: '1 1 140px' }} />
        <FormSelect name={`${base}.maxWeightUnit`} label="Đơn vị" options={units(WEIGHT_UNITS)} sx={{ minWidth: 90 }} />
      </Stack>
    </Stack>
  )
}

interface VariantCardProps {
  index: number
  productType: ProductType
  candidates: VariantCandidate[]
  canRemove: boolean
  defaultExpanded: boolean
  hasError: boolean
  onRemove: () => void
}

export function VariantCard({ index, productType, candidates, canRemove, defaultExpanded, hasError, onRemove }: VariantCardProps) {
  const { control } = useFormContext<ProductFormInput>()
  const options = useWatch({ control, name: 'options' })
  const sku = useWatch({ control, name: `variants.${index}.sku` })
  const price = useWatch({ control, name: `variants.${index}.price` })
  const base = `variants.${index}`
  const title = sku || `Biến thể ${index + 1}`
  const priceNumber = Number(price)

  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters variant="outlined" sx={hasError ? { borderColor: 'error.main' } : undefined}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-label={`Biến thể ${title}`}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }} noWrap>
            {title}
          </Typography>
          {Number.isFinite(priceNumber) && priceNumber > 0 && (
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(priceNumber)}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormTextField name={`${base}.sku`} label="SKU" />
            <FormTextField name={`${base}.price`} label="Giá (₫)" type="number" slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormTextField name={`${base}.stockQuantity`} label="Tồn kho" type="number" slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
            <FormSelect name={`${base}.status`} label="Trạng thái" options={toOptions(PRODUCT_STATUS_LABELS)} />
          </Stack>

          {options.length > 0 && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {options.map((option) => (
                <FormSelect
                  key={option.id}
                  name={`${base}.optionChoices.${option.id}`}
                  label={option.name || 'Tuỳ chọn'}
                  options={option.values.filter((value) => value.value.trim() !== '').map((value) => ({ value: value.id, label: value.value }))}
                />
              ))}
            </Stack>
          )}

          <Divider />
          <SizeFields base={base} />
          <Divider />
          <PolicyFields base={base} index={index} />
          {productType === 'READY_MADE_GIFT_BOX' && (
            <>
              <Divider />
              <GiftBoxFields base={base} />
            </>
          )}
          {productType === 'READY_MADE_GIFT_SET' && (
            <>
              <Divider />
              <BundleEditor variantIndex={index} candidates={candidates} />
            </>
          )}
          {canRemove && (
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <IconButton aria-label={`Xoá biến thể ${title}`} onClick={onRemove} color="error">
                <DeleteIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
