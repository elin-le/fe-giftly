import type { MessageRenderingMethod } from '@/features/products/types'
import { getItemPrice } from '../giftBox'
import { type BuilderCatalog, type VariantEntry } from '../catalog'
import type { GiftBoxDraft } from '../types'
import { CardMessageEditor } from './CardMessageEditor'
import { OptionPicker } from './OptionPicker'

interface DecorStepProps {
  catalog: Pick<BuilderCatalog, 'accessories' | 'cards'>
  draft: GiftBoxDraft
  onToggle: (entry: VariantEntry) => void
  onCardMessage: (variantId: string, patch: { messageText?: string; messageRenderingMethod?: MessageRenderingMethod }) => void
}

export function DecorStep({ catalog, draft, onToggle, onCardMessage }: DecorStepProps) {
  const selectedIds = new Set(draft.items.map((item) => item.variantId))
  const price = (entry: VariantEntry) => getItemPrice({ productType: entry.product.productType, listPrice: entry.variant.price })
  const chosenCards = draft.items.filter((item) => item.productType === 'GREETING_CARD')

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground">Gói quà thật xinh: chọn phụ kiện đóng gói (miễn phí), thiệp và viết lời chúc.</p>
      <OptionPicker label="Phụ kiện đóng gói" entries={catalog.accessories} selectedIds={selectedIds} getPrice={price} onToggle={onToggle} />
      <OptionPicker label="Thiệp" entries={catalog.cards} selectedIds={selectedIds} getPrice={price} onToggle={onToggle} />
      {chosenCards.map((card) => (
        <CardMessageEditor
          key={card.variantId}
          id={`card-${card.variantId}`}
          title={card.productName}
          message={card.messageText}
          method={card.messageRenderingMethod}
          onMessageChange={(messageText) => onCardMessage(card.variantId, { messageText })}
          onMethodChange={(messageRenderingMethod) => onCardMessage(card.variantId, { messageRenderingMethod })}
        />
      ))}
    </div>
  )
}

