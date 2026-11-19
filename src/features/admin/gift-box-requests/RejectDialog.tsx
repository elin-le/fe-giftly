import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useState } from 'react'

interface RejectDialogProps {
  open: boolean
  isBusy: boolean
  onSubmit: (note: string) => void
  onClose: () => void
}

/** Từ chối phải kèm lý do để khách biết cần chỉnh gì (khách vẫn sửa lại được). */
export function RejectDialog({ open, isBusy, onSubmit, onClose }: RejectDialogProps) {
  const [note, setNote] = useState('')
  const trimmed = note.trim()
  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Từ chối yêu cầu hộp quà</DialogTitle>
      <DialogContent>
        <TextField autoFocus required fullWidth multiline minRows={3} margin="dense" label="Lý do / hướng dẫn cho khách" value={note} onChange={(e) => setNote(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isBusy}>Huỷ</Button>
        <Button color="error" variant="contained" disabled={isBusy || !trimmed} onClick={() => onSubmit(trimmed)}>Từ chối</Button>
      </DialogActions>
    </Dialog>
  )
}
