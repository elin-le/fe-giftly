import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GiftBoxContents } from '@/features/gift-builder/components/GiftBoxContents'
import { ReviewStatusBadge } from '@/features/gift-builder/components/ReviewStatusBadge'
import { PolicyNotes } from '@/features/gift-builder/components/PolicyNotes'
import { formatCurrency } from '@/lib/format'
import type { GiftBoxCartItem } from '../types'
import { GiftBoxThumb } from './CartItemThumb'

interface CartGiftBoxLineProps {
  item: GiftBoxCartItem
  disabled?: boolean
  onRemove: (itemId: string) => void
}

/** Hộp quà tùy chỉnh: luôn số lượng 1 — muốn thêm hộp nữa thì thiết kế hộp mới. */
export function CartGiftBoxLine({ item, disabled = false, onRemove }: CartGiftBoxLineProps) {
  const { giftBox } = item
  const lines = [giftBox.box, ...giftBox.items].map((line) => ({
    id: line.variantId,
    role: line.role,
    name: line.optionLabel ? `${line.productName} (${line.optionLabel})` : line.productName,
    quantity: line.quantity,
    isComplimentary: line.isComplimentary,
    messageText: line.messageText,
    messageRenderingMethod: line.messageRenderingMethod,
  }))

  return (
    <li className="flex flex-col gap-3 rounded-card border border-accent/60 bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <GiftBoxThumb name={`Hộp quà tùy chỉnh · ${giftBox.box.productName}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2 font-bold">
            Hộp quà tùy chỉnh <ReviewStatusBadge status={giftBox.reviewStatus} />
          </span>
          {giftBox.reviewNote && giftBox.reviewStatus !== 'NOT_REQUIRED' && (
            <p className="rounded-2xl bg-accent-soft p-2 text-xs text-accent-foreground">{giftBox.reviewNote}</p>
          )}
          <GiftBoxContents lines={lines} />
          <PolicyNotes policy={item} subtotal={item.subtotal} />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-10 shrink-0 text-danger"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          aria-label="Xoá hộp quà tùy chỉnh khỏi giỏ"
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        {giftBox.reviewStatus !== 'APPROVED' ? (
          <Button asChild size="sm" variant="outline">
            <Link to={`/builder?edit=${giftBox.id}`}>
              <Pencil /> Chỉnh sửa
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <span className="text-lg font-bold">{formatCurrency(item.subtotal)}</span>
      </div>
    </li>
  )
}
