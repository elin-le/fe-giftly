import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { emptyVariantForm, type ProductFormInput } from '../productFormSchema'
import type { VariantCandidate } from './bundleCandidates'
import { VariantCard } from './VariantCard'

export function VariantsTab({ candidates }: { candidates: VariantCandidate[] }) {
  const { control, formState } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const productType = useWatch({ control, name: 'productType' })
  const variantErrors = formState.errors.variants

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Mỗi biến thể có SKU, giá và tồn kho riêng. Biến thể đã có trong đơn hàng không xoá được; hãy chuyển sang "Ngừng bán".
      </Typography>
      {typeof variantErrors?.message === 'string' && (
        <Typography variant="caption" color="error">
          {variantErrors.message}
        </Typography>
      )}
      {fields.map((field, index) => (
        <VariantCard
          key={field.id}
          index={index}
          productType={productType}
          candidates={candidates}
          canRemove={fields.length > 1}
          defaultExpanded={fields.length === 1 || Boolean(variantErrors?.[index])}
          hasError={Boolean(variantErrors?.[index])}
          onRemove={() => remove(index)}
        />
      ))}
      <Box>
        <Button startIcon={<AddIcon />} onClick={() => append(emptyVariantForm())}>
          Thêm biến thể
        </Button>
      </Box>
    </Stack>
  )
}
