import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import UploadIcon from '@mui/icons-material/UploadFileOutlined'
import { useRef, useState } from 'react'
import { toApiError } from '@/api/errors'
import { uploadsApi } from '@/features/products/api/uploadsApi'
import { isImageUrl, validateImageFile } from '@/features/products/imageUpload'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import type { ProductFormInput } from '../productFormSchema'
import { FormSelect, FormTextField } from './FormFields'

export function ImagesTab() {
  const { control, setValue, getValues } = useFormContext<ProductFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: 'images' })
  const images = useWatch({ control, name: 'images' })
  const variants = useWatch({ control, name: 'variants' })
  // Chỉ biến thể đã lưu mới có id để gắn ảnh riêng.
  const savedVariants = variants.flatMap((variant) => (variant.id ? [{ value: variant.id, label: variant.label ? `${variant.label} · ${variant.sku}` : variant.sku }] : []))

  const fileInput = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  /** Tải nhiều ảnh từ thiết bị: mỗi tệp thành một dòng ảnh; tệp lỗi được báo riêng, không chặn các tệp còn lại. */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadError(null)
    const errors: string[] = []
    for (const file of Array.from(files)) {
      const problem = validateImageFile(file)
      if (problem) { errors.push(`${file.name}: ${problem}`); continue }
      try {
        const uploaded = await uploadsApi.image(file)
        append({ imageUrl: uploaded.secureUrl, isThumbnail: false, productVariantId: '' })
      } catch (error) {
        errors.push(`${file.name}: ${toApiError(error).message}`)
      }
    }
    if (errors.length > 0) setUploadError(errors.join(' · '))
    setIsUploading(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  const makeThumbnail = (index: number) =>
    getValues('images').forEach((_image, i) => setValue(`images.${i}.isThumbnail`, i === index, { shouldDirty: true }))

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Thêm ảnh bằng một trong hai cách: dán đường dẫn (URL) hoặc tải ảnh từ thiết bị (JPG/PNG/WebP/GIF, tối đa 2 MB). Ảnh chung hiển thị cho cả sản phẩm; ảnh riêng gắn với một biến thể đã lưu, ví dụ theo màu. Ảnh đầu tiên là ảnh đại diện nếu bạn không chọn.
      </Typography>
      {fields.map((field, index) => {
        const url = images[index]?.imageUrl ?? ''
        return (
          <Stack key={field.id} spacing={1.5} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
                {isImageUrl(url) && <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </Box>
              <FormTextField name={`images.${index}.imageUrl`} label="Đường dẫn ảnh" />
              <IconButton aria-label={`Xoá ảnh ${index + 1}`} onClick={() => remove(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <FormSelect name={`images.${index}.productVariantId`} label="Áp dụng cho" emptyLabel="Cả sản phẩm (ảnh chung)" options={savedVariants} />
              <FormControlLabel
                sx={{ flexShrink: 0 }}
                control={<Radio checked={Boolean(images[index]?.isThumbnail)} onChange={() => makeThumbnail(index)} />}
                label="Ảnh đại diện"
              />
            </Stack>
          </Stack>
        )
      })}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Button startIcon={<AddIcon />} onClick={() => append({ imageUrl: '', isThumbnail: false, productVariantId: '' })}>
          Thêm ảnh
        </Button>
        <Button variant="outlined" disabled={isUploading} startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />} onClick={() => fileInput.current?.click()}>
          Tải ảnh từ thiết bị
        </Button>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden aria-label="Chọn ảnh từ thiết bị" onChange={(event) => void handleFiles(event.target.files)} />
      </Stack>
      {uploadError && <Typography role="alert" variant="body2" color="error">{uploadError}</Typography>}
    </Stack>
  )
}
