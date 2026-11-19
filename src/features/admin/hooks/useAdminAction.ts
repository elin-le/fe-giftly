import { useCallback, useState } from 'react'
import { toApiError } from '@/api/errors'
import type { useNotice } from './useNotice'

/** Chạy thao tác ghi của admin: chặn gửi lặp (isBusy), báo thành công/lỗi bằng snackbar, tải lại dữ liệu khi xong. */
export function useAdminAction(notice: ReturnType<typeof useNotice>, onDone: () => void) {
  const [isBusy, setIsBusy] = useState(false)
  const { success, error } = notice

  const run = useCallback(
    async (action: () => Promise<unknown>, successMessage: string): Promise<boolean> => {
      if (isBusy) return false
      setIsBusy(true)
      try {
        await action()
        success(successMessage)
        onDone()
        return true
      } catch (err) {
        error(toApiError(err).message)
        return false
      } finally {
        setIsBusy(false)
      }
    },
    [isBusy, success, error, onDone],
  )

  return { isBusy, run }
}
