import { NavLink } from 'react-router-dom'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { CartBadgeLink } from '@/features/cart/components/CartBadgeLink'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

// Giỏ hàng có nút riêng (kèm số lượng) bên phải nên không lặp lại trong thanh điều hướng.
export const STORE_NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/products', label: 'Cửa hàng', end: false },
  { to: '/builder', label: 'Tự thiết kế', end: false },
  { to: '/orders', label: 'Đơn hàng', end: false },
] as const

export function StoreHeader() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-[calc(100%-1.5rem)] max-w-6xl">
      <div className="flex items-center justify-between rounded-full border border-border bg-surface/80 py-2 pl-4 pr-2 shadow-soft backdrop-blur-md">
        <Logo />

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          {STORE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-raised',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <CartBadgeLink />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
