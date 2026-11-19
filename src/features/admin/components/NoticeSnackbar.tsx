import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import type { Notice } from '../hooks/useNotice'

interface NoticeSnackbarProps {
  notice: Notice | null
  onClose: () => void
}

export function NoticeSnackbar({ notice, onClose }: NoticeSnackbarProps) {
  return (
    <Snackbar
      open={notice !== null}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={notice?.severity ?? 'success'} variant="filled" onClose={onClose}>
        {notice?.message}
      </Alert>
    </Snackbar>
  )
}
