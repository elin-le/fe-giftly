import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'

/**
 * Chặn một hành động cần đăng nhập (vd. thêm vào giỏ hàng).
 * Đã đăng nhập → chạy ngay; chưa → chuyển tới trang đăng nhập kèm lý do và trang để quay lại.
 */
export function useAuthGate() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useCallback(
    (reason: string, action: () => void) => {
      if (isAuthenticated) {
        action()
        return
      }
      navigate('/signin', { state: { from: `${pathname}${search}`, reason } })
    },
    [isAuthenticated, navigate, pathname, search],
  )
}
