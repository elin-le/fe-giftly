import { EMPTY_DRAFT } from './giftBox'
import { useGiftBuilderStore } from './giftBuilderStore'
import { entryOf, makeBox, makeCard, makeGift } from './testUtils'
import { makeVariant } from '@/features/products/testUtils'

const state = () => useGiftBuilderStore.getState()

describe('giftBuilderStore', () => {
  beforeEach(() => state().reset())

  it('bắt đầu với bản nháp rỗng', () => {
    expect(state().draft).toEqual(EMPTY_DRAFT)
  })

  it('chọn hộp, thêm món, thiệp và lời chúc', () => {
    state().chooseBox(entryOf(makeBox()))
    state().addItem(entryOf(makeGift()))
    state().toggleItem(entryOf(makeCard()))
    state().setCardMessage('k1-v', { messageText: 'Chúc mừng' })
    expect(state().draft.box?.variantId).toBe('bv1')
    expect(state().draft.items).toHaveLength(2)
    expect(state().draft.items[1]?.messageText).toBe('Chúc mừng')
  })

  it('bỏ qua hộp không mua được', () => {
    state().chooseBox(entryOf(makeBox({ variants: [makeVariant({ id: 'x', stockQuantity: 0 })] })))
    expect(state().draft.box).toBeNull()
  })

  it('đặt số lượng về 0 thì bỏ món', () => {
    const gift = entryOf(makeGift())
    state().addItem(gift)
    state().setItemQuantity(gift, 0)
    expect(state().draft.items).toEqual([])
  })

  it('reset đưa về bản nháp rỗng', () => {
    state().chooseBox(entryOf(makeBox()))
    state().reset()
    expect(state().draft).toEqual(EMPTY_DRAFT)
  })
})
