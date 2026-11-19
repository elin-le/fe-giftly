import { ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { selectCartCount, useCartStore } from '../cartStore'

export function CartBadgeLink() {
  const count = useCartStore(selectCartCount)

  return (
    <Link
      to="/cart"
      data-cart-target
      aria-label={`Giỏ hàng, ${count} sản phẩm`}
      className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-surface-raised"
    >
      <ShoppingBag className="size-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-accent-foreground"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
