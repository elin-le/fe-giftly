import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import { Controller, useFormContext } from 'react-hook-form'
import type { ProductFormInput } from '../productFormSchema'

type FieldProps = { name: string; label: string } & Omit<TextFieldProps, 'name' | 'label' | 'select'>

/** Ô nhập nối với react-hook-form theo đường dẫn; lỗi lấy từ schema. */
export function FormTextField({ name, label, ...props }: FieldProps) {
  const { control } = useFormContext<ProductFormInput>()
  return (
    <Controller
      name={name as never}
      control={control}
      render={({ field, fieldState }) => (
        <TextField {...field} value={field.value ?? ''} label={label} size="small" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} {...props} />
      )}
    />
  )
}

type SelectProps = FieldProps & { options: readonly { value: string; label: string }[]; emptyLabel?: string }

/** Ô chọn một giá trị; `emptyLabel` thêm lựa chọn rỗng. */
export function FormSelect({ name, label, options, emptyLabel, ...props }: SelectProps) {
  const { control } = useFormContext<ProductFormInput>()
  return (
    <Controller
      name={name as never}
      control={control}
      render={({ field, fieldState }) => (
        <TextField {...field} value={field.value ?? ''} select label={label} size="small" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} {...props}>
          {emptyLabel !== undefined && <MenuItem value="">{emptyLabel}</MenuItem>}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  )
}

export function FormSwitch({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext<ProductFormInput>()
  return (
    <Controller
      name={name as never}
      control={control}
      render={({ field }) => <FormControlLabel control={<Switch checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />} label={label} />}
    />
  )
}

export const toOptions = <T extends string>(labels: Record<T, string>): { value: T; label: string }[] =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
