import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/input'
import { cn } from '@/lib/cn'
import {
  MESSAGE_RENDERING_LABELS,
  MESSAGE_RENDERING_METHODS,
  type MessageRenderingMethod,
} from '@/features/products/types'
import { MESSAGE_MAX_LENGTH } from '../constants'

const SUGGESTIONS = [
  'Chúc bạn thật nhiều niềm vui và sức khỏe.',
  'Cảm ơn vì đã luôn ở bên mình.',
  'Chúc mừng ngày tốt nghiệp — tự hào về bạn!',
]

interface CardMessageEditorProps {
  /** Dùng để phân biệt nhiều thiệp trên cùng trang. */
  id: string
  title: string
  message: string
  method: MessageRenderingMethod
  onMessageChange: (message: string) => void
  onMethodChange: (method: MessageRenderingMethod) => void
}

/** Lời chúc cho một thiệp: nội dung và cách thể hiện (viết tay hoặc in). */
export function CardMessageEditor({ id, title, message, method, onMessageChange, onMethodChange }: CardMessageEditorProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <Label htmlFor={`${id}-message`}>
        Lời chúc cho {title} <span className="text-sm font-normal text-muted-foreground">(tuỳ chọn)</span>
      </Label>
      <Textarea id={`${id}-message`} value={message} maxLength={MESSAGE_MAX_LENGTH} rows={4} onChange={(event) => onMessageChange(event.target.value)} />
      <span className="text-right text-xs text-muted-foreground">
        {message.length}/{MESSAGE_MAX_LENGTH}
      </span>

      <div role="radiogroup" aria-label={`Cách thể hiện lời chúc của ${title}`} className="flex gap-2">
        {MESSAGE_RENDERING_METHODS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={method === value}
            onClick={() => onMethodChange(value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              method === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-raised',
            )}
          >
            {MESSAGE_RENDERING_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Gợi ý lời chúc">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onMessageChange(suggestion)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs transition-colors hover:bg-surface-raised"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
