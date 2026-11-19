import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import type { RoleName } from '../types'

interface RequireAuthProps {
  /** Yêu cầu thêm vai trò (vd. ROLE_ADMIN). Đã đăng nhập mà thiếu quyền → trang 403. */
  role?: RoleName
  /** Lý do hiển thị ở trang đăng nhập. */
  reason?: string
  /** Bỏ trống để dùng như layout route (render `<Outlet />`). */
  children?: ReactNode
}

/** Bảo vệ route: chưa đăng nhập thì chuyển tới /signin và quay lại đúng trang sau khi đăng nhập. */
export function RequireAuth({ role, reason, children }: RequireAuthProps) {
  const { pathname, search } = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const hasRole = useAuthStore((state) => role === undefined || (state.user?.roles.includes(role) ?? false))

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: `${pathname}${search}`, reason }} />
  }
  if (!hasRole) return <ForbiddenPage />

  return children ?? <Outlet />
}
