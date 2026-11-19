import { Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PlaceholderArt, ProductImage } from '@/features/products/components/ProductImage'
import type { ProductType } from '@/features/products/types'
import { cn } from '@/lib/cn'

const FRAME = 'block size-20 shrink-0 overflow-hidden rounded-2xl border border-border sm:size-24'

interface VariantThumbProps {
  productId: string
  name: string
  imageUrl: string | null
  productType: ProductType
}

/** Ảnh sản phẩm trong giỏ: bấm để mở trang chi tiết; chưa có ảnh thì dùng hình minh hoạ mặc định. */
export function VariantThumb({ productId, name, imageUrl, productType }: VariantThumbProps) {
  return (
    <Link to={`/products/${productId}`} aria-label={`Xem chi tiết ${name}`} className={cn(FRAME, 'transition-transform hover:scale-105')}>
      <ProductImage product={{ name, productType, images: imageUrl ? [{ id: 'cart', imageUrl, secureUrl: imageUrl, publicId: '', isThumbnail: true, productVariantId: null }] : [] }} />
    </Link>
  )
}

/** Hộp quà tùy chỉnh chưa có ảnh riêng: dùng hình hộp quà minh hoạ. */
export function GiftBoxThumb({ name }: { name: string }) {
  return (
    <span className={cn(FRAME, 'relative')}>
      <PlaceholderArt name={name} productType="READY_MADE_GIFT_BOX" className="size-full" />
      <Gift aria-hidden className="absolute bottom-1 right-1 size-4 text-primary" />
    </span>
  )
}
