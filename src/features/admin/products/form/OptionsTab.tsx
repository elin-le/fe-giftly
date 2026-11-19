import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { newId, type ProductFormInput } from '../productFormSchema'
import { FormTextField } from './FormFields'

/** Quên lựa chọn của mọi biến thể trỏ tới giá trị/tuỳ chọn vừa bị xoá, để form báo "Chọn …" thay vì giữ id mồ côi. */
function useClearChoices() {
  const { getValues, setValue } = useFormContext<ProductFormInput>()
  return (optionId: string, valueId?: string) =>
    getValues('variants').forEach((variant, index) => {
      const choices = { ...variant.optionChoices }
      if (valueId === undefined || choices[optionId] === valueId) delete choices[optionId]
      setValue(`variants.${index}.optionChoices`, choices, { shouldDirty: true })
    })
}

function ValueRows({ optionIndex, optionId }: { optionIndex: number; optionId: string }) {
  const { control } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: `options.${optionIndex}.values` })
  const values = useWatch({ control, name: `options.${optionIndex}.values` })
  const clearChoices = useClearChoices()

  return (
    <Stack spacing={1}>
      {fields.map((field, index) => {
        const color = values[index]?.colorHex ?? ''
        return (
          <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormTextField name={`options.${optionIndex}.values.${index}.value`} label="Giá trị" />
            <FormTextField
              name={`options.${optionIndex}.values.${index}.colorHex`}
              label="Mã màu"
              placeholder="#RRGGBB"
              slotProps={{ input: { startAdornment: <Box aria-hidden sx={{ width: 14, height: 14, mr: 1, borderRadius: '50%', border: 1, borderColor: 'divider', bgcolor: /^#[0-9a-fA-F]{6}$/.test(color) ? color : 'transparent' }} /> } }}
            />
            <IconButton
              aria-label={`Xoá giá trị ${values[index]?.value || index + 1}`}
              onClick={() => {
                clearChoices(optionId, values[index]?.id)
                remove(index)
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        )
      })}
      <Box>
        <Button size="small" startIcon={<AddIcon />} onClick={() => append({ id: newId(), value: '', colorHex: '' })}>
          Thêm giá trị
        </Button>
      </Box>
    </Stack>
  )
}

export function OptionsTab() {
  const { control } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const options = useWatch({ control, name: 'options' })
  const clearChoices = useClearChoices()

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Tuỳ chọn là các trục như Màu, Kích cỡ. Mỗi biến thể chọn đúng một giá trị cho từng tuỳ chọn ở thẻ "Biến thể". Sản phẩm không cần tuỳ chọn thì để trống.
      </Typography>
      {fields.map((field, index) => (
        <Stack key={field.id} spacing={1.5} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormTextField name={`options.${index}.name`} label="Tên tuỳ chọn" placeholder="Màu, Kích cỡ…" />
            <IconButton
              aria-label={`Xoá tuỳ chọn ${options[index]?.name || index + 1}`}
              onClick={() => {
                clearChoices(options[index]?.id ?? '')
                remove(index)
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
          <ValueRows optionIndex={index} optionId={options[index]?.id ?? ''} />
        </Stack>
      ))}
      <Box>
        <Button startIcon={<AddIcon />} onClick={() => append({ id: newId(), name: '', values: [{ id: newId(), value: '', colorHex: '' }] })}>
          Thêm tuỳ chọn
        </Button>
      </Box>
    </Stack>
  )
}
