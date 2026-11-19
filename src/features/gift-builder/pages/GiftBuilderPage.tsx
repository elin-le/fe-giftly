import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BoxPreview } from '../components/BoxPreview'
import { BoxStep } from '../components/BoxStep'
import { BuilderStepper } from '../components/BuilderStepper'
import { ItemsStep } from '../components/ItemsStep'
import { DecorStep } from '../components/DecorStep'
import { ReviewStep } from '../components/ReviewStep'
import { BUILDER_STEPS, getMaxReachableIndex } from '../builderSteps'
import { useGiftBuilderStore } from '../giftBuilderStore'
import { useAddGiftBoxToCart } from '../hooks/useAddGiftBoxToCart'
import { useBuilderCatalog } from '../hooks/useBuilderCatalog'
import { useEditGiftBox } from '../hooks/useEditGiftBox'
import { EditBanner } from '../components/EditBanner'

const EASE = [0.22, 1, 0.36, 1] as const

export function GiftBuilderPage() {
  const catalog = useBuilderCatalog()
  const { draft, chooseBox, setItemQuantity, toggleItem, setCardMessage } = useGiftBuilderStore()
  const addToCart = useAddGiftBoxToCart()
  const edit = useEditGiftBox(catalog)
  const [requestedIndex, setRequestedIndex] = useState(0)

  const maxReachable = getMaxReachableIndex(draft)
  // Bản nháp có thể đổi (vd. bỏ hết món) nên luôn kẹp bước hiện tại trong phạm vi cho phép.
  const stepIndex = Math.min(requestedIndex, maxReachable)
  const step = BUILDER_STEPS[stepIndex]?.id ?? 'box'

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{edit.isEditing ? 'Chỉnh sửa hộp quà' : 'Tự thiết kế hộp quà'}</h1>
        <p className="text-muted-foreground">Chọn hộp, món quà, phụ kiện đóng gói, thiệp và lời chúc — hộp quà của riêng bạn.</p>
      </header>

      {edit.isEditing && <EditBanner view={edit.view} error={edit.error} />}

      <BuilderStepper currentIndex={stepIndex} maxReachableIndex={maxReachable} onSelect={setRequestedIndex} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-8 lg:order-first">
          {catalog.error ? (
            <div role="alert" className="grid place-items-center gap-3 rounded-card border border-danger/40 p-10 text-center">
              <p className="text-danger">{catalog.error}</p>
              <Button variant="outline" onClick={catalog.reload}>
                Thử lại
              </Button>
            </div>
          ) : catalog.isLoading ? (
            <div aria-busy="true" aria-label="Đang tải" className="h-64 animate-pulse rounded-card bg-surface-raised" />
          ) : catalog.boxes.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">Hiện chưa có hộp quà nào để thiết kế.</p>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {step === 'box' && <BoxStep boxes={catalog.boxes} draft={draft} onSelect={chooseBox} />}
                {step === 'items' && <ItemsStep items={catalog.items} draft={draft} onQuantityChange={setItemQuantity} />}
                {step === 'decor' && <DecorStep catalog={catalog} draft={draft} onToggle={toggleItem} onCardMessage={setCardMessage} />}
                {step === 'review' && <ReviewStep draft={draft} isSubmitting={addToCart.isSubmitting} submitError={addToCart.error} onAddToCart={addToCart.submit} />}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="flex justify-between gap-3">
            <Button variant="outline" disabled={stepIndex === 0} onClick={() => setRequestedIndex(stepIndex - 1)}>
              <ArrowLeft /> Quay lại
            </Button>
            {stepIndex < BUILDER_STEPS.length - 1 && (
              <Button disabled={stepIndex + 1 > maxReachable} onClick={() => setRequestedIndex(stepIndex + 1)}>
                Tiếp tục <ArrowRight />
              </Button>
            )}
          </div>
        </div>

        <aside className="order-first lg:sticky lg:top-24 lg:order-last lg:self-start">
          <BoxPreview draft={draft} />
        </aside>
      </div>
    </section>
  )
}
