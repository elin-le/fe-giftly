import { countContent } from './giftBox'
import type { GiftBoxDraft } from './types'

export const BUILDER_STEPS = [
  { id: 'box', label: 'Chọn hộp' },
  { id: 'items', label: 'Chọn món' },
  { id: 'decor', label: 'Trang trí' },
  { id: 'review', label: 'Hoàn tất' },
] as const

export type BuilderStepId = (typeof BUILDER_STEPS)[number]['id']

/** Chỉ số bước xa nhất được phép tới: cần có hộp để chọn món, có món để trang trí và hoàn tất. */
export function getMaxReachableIndex(draft: GiftBoxDraft): number {
  if (!draft.box) return 0
  return countContent(draft) > 0 ? BUILDER_STEPS.length - 1 : 1
}
