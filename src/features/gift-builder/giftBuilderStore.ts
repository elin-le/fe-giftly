import { create } from 'zustand'
import type { MessageRenderingMethod } from '@/features/products/types'
import type { VariantEntry } from './catalog'
import { addItem, chooseBox, EMPTY_DRAFT, setCardMessage, setItemQuantity, toggleItem } from './giftBox'
import type { GiftBoxDraft } from './types'

interface GiftBuilderState {
  draft: GiftBoxDraft
  /** Id cấu hình đang chỉnh sửa (khách sửa yêu cầu đã gửi); null khi thiết kế mới. */
  editingId: string | null
  load: (draft: GiftBoxDraft, editingId: string) => void
  chooseBox: (entry: VariantEntry) => void
  addItem: (entry: VariantEntry) => void
  setItemQuantity: (entry: VariantEntry, quantity: number) => void
  toggleItem: (entry: VariantEntry) => void
  setCardMessage: (variantId: string, patch: { messageText?: string; messageRenderingMethod?: MessageRenderingMethod }) => void
  reset: () => void
}

/** Bản nháp chỉ giữ trong bộ nhớ: tồn kho/giá có thể đổi nên không lưu qua các lần tải lại trang. */
export const useGiftBuilderStore = create<GiftBuilderState>()((set) => ({
  draft: EMPTY_DRAFT,
  editingId: null,
  load: (draft, editingId) => set({ draft, editingId }),
  chooseBox: (entry) => set(({ draft }) => ({ draft: chooseBox(draft, entry) })),
  addItem: (entry) => set(({ draft }) => ({ draft: addItem(draft, entry) })),
  setItemQuantity: (entry, quantity) => set(({ draft }) => ({ draft: setItemQuantity(draft, entry, quantity) })),
  toggleItem: (entry) => set(({ draft }) => ({ draft: toggleItem(draft, entry) })),
  setCardMessage: (variantId, patch) => set(({ draft }) => ({ draft: setCardMessage(draft, variantId, patch) })),
  reset: () => set({ draft: EMPTY_DRAFT, editingId: null }),
}))
