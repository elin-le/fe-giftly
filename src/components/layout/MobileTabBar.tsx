import { Home, PackageCheck, PackagePlus, ShoppingBag, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { selectCartCount, useCartStore } from '@/features/cart/cartStore'
import { cn } from '@/lib/cn'

const TABS = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/products', label: 'Cửa hàng', icon: Store, end: false },
  { to: '/builder', label: 'Tự thiết kế', icon: PackagePlus, end: false },
  { to: '/cart', label: 'Giỏ hàng', icon: ShoppingBag, end: false },
  { to: '/orders', label: 'Đơn hàng', icon: PackageCheck, end: false },
] as const

/** Thanh điều hướng nổi ở cạnh dưới — chỉ hiện trên mobile. */
export function MobileTabBar() {
  const count = useCartStore(selectCartCount)

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-full border border-border bg-surface/90 p-1.5 shadow-soft backdrop-blur-md md:hidden"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="relative flex-1">
          {({ isActive }) => (
            <span
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                <Icon className="size-5" />
                {to === '/cart' && count > 0 && (
                  <span
                    aria-label={`${count} sản phẩm trong giỏ`}
                    className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground"
                  >
                    {count}
                  </span>
                )}
              </span>
              <span className="relative">{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
