import { PackageOpen } from 'lucide-react'
import { motion } from 'motion/react'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onQuickAdd: (product: Product) => void
  onRetry: () => void
}

const GRID_CLASS = 'grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3'

export function ProductGrid({ products, isLoading, error, onQuickAdd, onRetry }: ProductGridProps) {
  if (error) {
    return (
      <div role="alert" className="grid place-items-center gap-3 rounded-card border border-danger/40 p-10 text-center">
        <p className="text-danger">{error}</p>
        <button type="button" onClick={onRetry} className="text-sm font-semibold underline">
          Thử lại
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={GRID_CLASS} aria-busy="true" aria-label="Đang tải sản phẩm">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-card bg-surface-raised" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="grid place-items-center gap-3 py-20 text-center text-muted-foreground">
        <PackageOpen className="size-10" strokeWidth={1.25} />
        <p>Không tìm thấy sản phẩm phù hợp.</p>
      </div>
    )
  }

  return (
    <motion.div
      className={GRID_CLASS}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          className="h-full"
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        >
          <ProductCard product={product} onQuickAdd={onQuickAdd} />
        </motion.div>
      ))}
    </motion.div>
  )
}
