import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { flyToCart } from '@/lib/flyToCart'
import { formatCurrency } from '@/lib/format'
import { getPriceRange, isPurchasable, isSimpleProduct } from '../productRules'
import { PRODUCT_TYPE_LABELS, type Product } from '../types'
import { ProductImage } from './ProductImage'
import { RatingStars } from './RatingStars'

interface ProductCardProps {
  product: Product
  /** Thêm nhanh (chỉ với sản phẩm một biến thể và không có lựa chọn kèm). */
  onQuickAdd: (product: Product) => void
}

/** Mọi thẻ cùng chiều cao: tiêu đề tối đa 2 dòng, mô tả tối đa 2 dòng và luôn chừa đủ chỗ dù ngắn hay dài. */
export function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const canBuy = isPurchasable(product)
  const range = getPriceRange(product)
  const isSimple = isSimpleProduct(product)
  const detailPath = `/products/${product.id}`
  const imageRef = useRef<HTMLAnchorElement>(null)

  const handleAdd = () => {
    flyToCart(imageRef.current, product.images.find((image) => image.isThumbnail)?.imageUrl ?? product.images[0]?.imageUrl)
    onQuickAdd(product)
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-soft transition-shadow hover:shadow-pop"
    >
      <Link ref={imageRef} to={detailPath} tabIndex={-1} aria-hidden className="relative block overflow-hidden">
        <ProductImage product={product} className="aspect-square w-full transition-transform duration-500 group-hover:scale-110" />
        {!canBuy && (
          <Badge tone="danger" className="absolute left-3 top-3 bg-surface">
            Hết hàng
          </Badge>
        )}
        {canBuy && product.productType !== 'REGULAR' && (
          <Badge tone="accent" className="absolute left-3 top-3">
            {PRODUCT_TYPE_LABELS[product.productType]}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug" title={product.name}>
          <Link to={detailPath} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <RatingStars value={product.ratingAverage} count={product.reviewCount} />
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground" title={product.description ?? undefined}>
          {product.description ?? ''}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="min-w-0 truncate text-lg font-bold text-primary">
            {range && range.min !== range.max && <span className="text-sm font-normal text-muted-foreground">Từ </span>}
            {range ? formatCurrency(range.min) : '—'}
          </span>
          {isSimple ? (
            <Button size="icon" variant="accent" disabled={!canBuy} onClick={handleAdd} aria-label={`Thêm ${product.name} vào giỏ`}>
              <Plus />
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to={detailPath} aria-label={`Chọn ${product.name}`}>
                Chọn
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
