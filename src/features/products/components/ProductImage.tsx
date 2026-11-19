import { Flower2, Gift, Mail, Package, Ribbon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getThumbnailUrl } from '../productRules'
import type { Product, ProductType } from '../types'

const ART: Record<ProductType, { icon: LucideIcon; tone: string }> = {
  REGULAR: { icon: Flower2, tone: 'from-rose-soft via-surface-raised to-accent-soft text-rose' },
  READY_MADE_GIFT_SET: { icon: Gift, tone: 'from-accent-soft via-surface-raised to-rose-soft text-primary' },
  READY_MADE_GIFT_BOX: { icon: Package, tone: 'from-mint-soft via-surface-raised to-accent-soft text-mint' },
  PACKAGING_ACCESSORY: { icon: Ribbon, tone: 'from-lilac-soft via-surface-raised to-rose-soft text-lilac' },
  GREETING_CARD: { icon: Mail, tone: 'from-rose-soft via-surface-raised to-lilac-soft text-rose' },
}

interface PlaceholderArtProps {
  name: string
  productType?: ProductType
  className?: string
}

/** Hình minh hoạ mặc định theo loại sản phẩm khi chưa có ảnh: nền gradient màu thương hiệu, biểu tượng lớn và các hình tròn trang trí. */
export function PlaceholderArt({ name, productType = 'READY_MADE_GIFT_SET', className }: PlaceholderArtProps) {
  const { icon: Icon, tone } = ART[productType]
  return (
    <div
      role="img"
      aria-label={name}
      className={cn('relative grid aspect-square w-full place-items-center overflow-hidden bg-gradient-to-br', tone, className)}
    >
      <span aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-surface/60" />
      <span aria-hidden className="absolute -bottom-8 -left-8 size-28 rounded-full bg-surface/50" />
      <Icon className="relative size-1/3 max-h-24 min-h-8 min-w-8 max-w-24" strokeWidth={1.25} />
    </div>
  )
}

interface ProductImageProps {
  product: Pick<Product, 'name' | 'images'> & { productType?: ProductType }
  className?: string
}

/** Ảnh sản phẩm; chưa có ảnh thì hiện hình minh hoạ mặc định theo loại. */
export function ProductImage({ product, className }: ProductImageProps) {
  const url = getThumbnailUrl(product)
  if (url) return <img src={url} alt={product.name} loading="lazy" className={cn('aspect-square w-full object-cover', className)} />
  return <PlaceholderArt name={product.name} productType={product.productType} className={className} />
}
