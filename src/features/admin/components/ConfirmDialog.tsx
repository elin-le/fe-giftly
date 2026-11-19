import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  isBusy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, isBusy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={isBusy ? undefined : onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isBusy}>Huỷ</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isBusy}>{isBusy ? 'Đang xử lý…' : confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
