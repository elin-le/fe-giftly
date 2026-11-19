import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface ConfirmDeleteDialogProps {
  productName: string | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({ productName, isDeleting, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={productName !== null} onClose={isDeleting ? undefined : onCancel}>
      <DialogTitle>Xoá sản phẩm?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sản phẩm “{productName}” sẽ bị xoá vĩnh viễn và không thể khôi phục.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isDeleting}>
          Huỷ
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Đang xoá…' : 'Xoá'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
