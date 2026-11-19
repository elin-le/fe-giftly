import { useCallback, useState } from 'react'

export interface Notice {
  message: string
  severity: 'success' | 'error'
}

/** Quản lý thông báo ngắn (snackbar) cho các thao tác của quản trị viên. */
export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null)

  const success = useCallback((message: string) => setNotice({ message, severity: 'success' }), [])
  const error = useCallback((message: string) => setNotice({ message, severity: 'error' }), [])
  const dismiss = useCallback(() => setNotice(null), [])

  return { notice, success, error, dismiss }
}
