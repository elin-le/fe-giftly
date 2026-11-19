import { LayoutDashboard, LogIn, LogOut, PackageCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { selectIsAdmin, selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

/** Góc tài khoản trên header: nút đăng nhập/đăng ký, hoặc menu người dùng khi đã đăng nhập. */
export function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isAdmin = useAuthStore(selectIsAdmin)
  const signOut = useAuthStore((state) => state.signOut)
  const showToast = useToastStore((state) => state.show)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          to="/signin"
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors hover:bg-surface-raised sm:px-4"
        >
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Đăng nhập</span>
        </Link>
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link to="/register">Đăng ký</Link>
        </Button>
      </div>
    )
  }

  const handleSignOut = () => {
    signOut()
    showToast('Đã đăng xuất', 'info')
    navigate('/', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Tài khoản của tôi"
          className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          {user.fullName.trim().charAt(0).toLocaleUpperCase('vi') || '?'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="font-bold">{user.fullName}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/orders">
            <PackageCheck /> Đơn hàng của tôi
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard /> Trang quản trị
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
