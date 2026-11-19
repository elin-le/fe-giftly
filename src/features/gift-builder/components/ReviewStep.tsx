import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { MESSAGE_RENDERING_LABELS } from '@/features/products/types'
import { calcGiftBoxTotal, getDraftIssues, getDraftNotice, getDraftPolicy, getItemPrice } from '../giftBox'
import { getItemRole } from '../componentRole'
import { COMPONENT_ROLE_LABELS } from '@/features/products/types'
import type { GiftBoxDraft } from '../types'
import { PolicyNotes } from './PolicyNotes'

interface ReviewStepProps {
  draft: GiftBoxDraft
  isSubmitting: boolean
  /** Lỗi từ server (vd. hết hàng) hiển thị ngay trên nút. */
  submitError: string | null
  onAddToCart: () => void
}

export function ReviewStep({ draft, isSubmitting, submitError, onAddToCart }: ReviewStepProps) {
  const issues = [...getDraftIssues(draft), ...(submitError ? [submitError] : [])]
  const total = calcGiftBoxTotal(draft)
  const notice = getDraftNotice(draft)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted-foreground">Kiểm tra lại hộp quà trước khi thêm vào giỏ.</p>

      <dl className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 text-sm">
        {draft.box && <Line name={draft.box.productName} detail={COMPONENT_ROLE_LABELS.BOX} amount={draft.box.price} />}
        {draft.items.map((item) => {
          const message = item.productType === 'GREETING_CARD' ? item.messageText.trim() : ''
          return (
            <div key={item.variantId} className="flex flex-col gap-1">
              <Line
                name={item.productName}
                detail={`${COMPONENT_ROLE_LABELS[getItemRole(item.productType)]}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`}
                amount={getItemPrice(item) * item.quantity}
              />
              {message && (
                <dd className="italic">
                  “{message}” <span className="not-italic text-muted-foreground">({MESSAGE_RENDERING_LABELS[item.messageRenderingMethod]})</span>
                </dd>
              )}
            </div>
          )
        })}
        <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
          <dt>Tổng cộng</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>

      <PolicyNotes policy={getDraftPolicy(draft)} subtotal={total} />

      {notice && (
        <p role="status" className={notice.tone === 'warning' ? 'rounded-2xl bg-accent-soft p-3 text-sm text-accent-foreground' : 'rounded-2xl bg-lilac-soft p-3 text-sm'}>
          {notice.text}
        </p>
      )}

      {issues.length > 0 && (
        <ul role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}

      <Button variant="accent" size="lg" disabled={getDraftIssues(draft).length > 0 || isSubmitting} onClick={onAddToCart}>
        <ShoppingBag /> {isSubmitting ? 'Đang thêm…' : 'Thêm vào giỏ hàng'}
      </Button>
    </div>
  )
}

function Line({ name, detail, amount }: { name: string; detail: string; amount: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>
        {name} <span className="text-muted-foreground">{detail}</span>
      </dt>
      <dd className="font-semibold">{amount === 0 ? 'Miễn phí' : formatCurrency(amount)}</dd>
    </div>
  )
}
