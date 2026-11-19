import { Flame } from 'lucide-react'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import type { Product } from '@/features/products/types'
import { SectionHeading } from './SectionHeading'

interface HotProductsProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onQuickAdd: (product: Product) => void
  onRetry: () => void
}

export function HotProducts({ products, isLoading, error, onQuickAdd, onRetry }: HotProductsProps) {
  return (
    <section className="flex flex-col gap-5" aria-label="Sản phẩm hot trong tháng">
      <SectionHeading title="Hot trong tháng" subtitle="Những món được chọn nhiều nhất 30 ngày qua." linkTo="/products" />
      <p className="-mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1 text-xs font-semibold text-foreground">
        <Flame className="size-3.5 text-danger" /> Bán chạy
      </p>
      <ProductGrid products={products} isLoading={isLoading} error={error} onQuickAdd={onQuickAdd} onRetry={onRetry} />
    </section>
  )
}
