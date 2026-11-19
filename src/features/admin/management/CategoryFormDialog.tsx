import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useEffect, useState, type FormEvent } from 'react'
import type { Category } from '@/features/products/types'
import { validateCategory } from './categoryRules'
import type { CategoryInput } from './types'

interface CategoryFormDialogProps {
  open: boolean
  category?: Category
  /** Các danh mục khác, dùng kiểm tra trùng tên. */
  others: Category[]
  isSaving: boolean
  onSubmit: (input: CategoryInput) => void
  onClose: () => void
}

export function CategoryFormDialog({ open, category, others, isSaving, onSubmit, onClose }: CategoryFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setDescription(category?.description ?? '')
      setError(null)
    }
  }, [open, category])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const input = { name: name.trim(), description: description.trim() || null }
    const problem = validateCategory(input, others)
    setError(problem)
    if (!problem) onSubmit(input)
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={submit} noValidate>
        <DialogTitle>{category ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField required autoFocus label="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} error={error !== null} helperText={error ?? ' '} />
            <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSaving}>Huỷ</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>{isSaving ? 'Đang lưu…' : 'Lưu'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
