import type { ReactNode } from 'react'
import { COMPONENT_ROLE_LABELS, MESSAGE_RENDERING_LABELS, type ComponentRole, type MessageRenderingMethod } from '@/features/products/types'

export interface ContentLine {
  id: string
  role: ComponentRole | null
  name: string
  quantity: number
  isComplimentary?: boolean
  messageText?: string | null
  messageRenderingMethod?: MessageRenderingMethod | null
  /** Nút hành động (vd. Đánh giá) hiển thị cuối dòng. */
  action?: ReactNode
}

/** Danh sách thành phần của một hộp quà tùy chỉnh hoặc set quà, kèm lời chúc của từng thiệp. */
export function GiftBoxContents({ lines }: { lines: ContentLine[] }) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {lines.map((line) => (
        <li key={line.id} className="flex flex-wrap items-start justify-between gap-x-3">
          <span className="min-w-0">
          {line.role && <span className="text-muted-foreground">{COMPONENT_ROLE_LABELS[line.role]}: </span>}
          {line.name}
          {line.quantity > 1 && <span className="text-muted-foreground"> × {line.quantity}</span>}
          {line.isComplimentary && line.role !== 'BOX' && <span className="text-muted-foreground"> · miễn phí</span>}
          {line.messageText && (
            <p className="italic">
              “{line.messageText}”
              {line.messageRenderingMethod && <span className="not-italic text-muted-foreground"> ({MESSAGE_RENDERING_LABELS[line.messageRenderingMethod]})</span>}
            </p>
          )}
          </span>
          {line.action}
        </li>
      ))}
    </ul>
  )
}
