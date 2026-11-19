import { Button } from '@/components/ui/button'
import { GiftBoxContents } from '@/features/gift-builder/components/GiftBoxContents'
import { formatCurrency } from '@/lib/format'
import { hasReviewForComponent, hasReviewForItem, isItemNoReturn } from '../orderRules'
import type { OrderItem, Review } from '../types'
import type { ReviewTarget } from './ReviewDialog'

interface OrderItemListProps {
  items: OrderItem[]
  /** Chỉ truyền khi đơn đã giao/hoàn thành thì nút Đánh giá mới hiển thị. */
  review?: { reviews: Review[]; onReview: (target: ReviewTarget) => void }
}

const variantText = (attributes: Record<string, string> | null): string | null =>
  attributes ? Object.values(attributes).join(' · ') : null

/** Dòng hàng của đơn từ snapshot: sản phẩm một dòng; set quà / hộp tùy chỉnh kèm thành phần, lời chúc, chính sách. */
export function OrderItemList({ items, review }: OrderItemListProps) {
  const reviewButton = (name: string, done: boolean, source: ReviewTarget['source']) =>
    review &&
    (done ? (
      <span className="text-xs text-muted-foreground">Đã đánh giá</span>
    ) : (
      <Button size="sm" variant="outline" aria-label={`Đánh giá ${name}`} onClick={() => review.onReview({ name, source })}>
        Đánh giá
      </Button>
    ))

  return (
    <ul className="flex flex-col gap-3 text-sm">
      {items.map((item) => {
        const variant = variantText(item.variantSnapshot)
        return (
          <li key={item.id} className="flex flex-col gap-2">
            <div className="flex justify-between gap-3">
              <span>
                {item.itemNameSnapshot}
                {variant && <span className="text-muted-foreground"> ({variant})</span>} <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {isItemNoReturn(item) && <span className="text-danger">Không đổi trả</span>}
              {item.isPerishableSnapshot && <span className="text-warning">Hàng dễ hỏng{item.shelfLifeHoursSnapshot ? ` · dùng trong ${item.shelfLifeHoursSnapshot} giờ` : ''}</span>}
              {item.requiredAdvanceAmount !== null && item.advancePaymentPercentSnapshot !== null && (
                <span className="text-warning">
                  Đặt cọc {item.advancePaymentPercentSnapshot}% ({formatCurrency(item.requiredAdvanceAmount)})
                </span>
              )}
              {item.productId && reviewButton(item.itemNameSnapshot, hasReviewForItem(review?.reviews ?? [], item), { orderItemId: item.id })}
            </div>

            {item.components.length > 0 && (
              <div className="rounded-2xl bg-surface-raised p-3">
                <GiftBoxContents
                  lines={item.components.map((component) => {
                    const detail = variantText(component.variantSnapshot)
                    const name = detail ? `${component.productNameSnapshot} (${detail})` : component.productNameSnapshot
                    return {
                      id: component.id,
                      role: component.componentRole,
                      name,
                      quantity: component.quantity,
                      isComplimentary: component.isComplimentary,
                      messageText: component.messageText,
                      messageRenderingMethod: component.messageRenderingMethod,
                      action:
                        component.componentRole === 'PRODUCT' && component.productId
                          ? reviewButton(name, hasReviewForComponent(review?.reviews ?? [], component), { orderItemComponentId: component.id })
                          : null,
                    }
                  })}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
