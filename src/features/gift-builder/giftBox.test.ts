import { MAX_CONTENT_ITEMS, MESSAGE_MAX_LENGTH } from './constants'
import {
  addItem,
  calcGiftBoxTotal,
  chooseBox,
  countContent,
  countItems,
  EMPTY_DRAFT,
  getDraftIssues, getDraftNotice,
  getDraftPolicy,
  setCardMessage,
  setItemQuantity,
  toggleItem,
  toPayload,
} from './giftBox'
import { entryOf, makeAccessory, makeBox, makeCard, makeGift } from './testUtils'
import { makeVariant } from '@/features/products/testUtils'
import type { GiftBoxDraft } from './types'

const withBox: GiftBoxDraft = chooseBox(EMPTY_DRAFT, entryOf(makeBox()))
const gift = entryOf(makeGift())

describe('chooseBox', () => {
  it('chọn hộp và đổi sang hộp khác thì thay thế', () => {
    expect(withBox.box?.variantId).toBe('bv1')
    const other = makeBox({ id: 'b2', variants: [makeVariant({ id: 'bv2', productId: 'b2', sku: 'B2', price: 130000, stockQuantity: 3 })] })
    expect(chooseBox(withBox, entryOf(other)).box?.variantId).toBe('bv2')
  })

  it.each([
    ['hết hàng', { stockQuantity: 0 }],
    ['ngừng bán', { status: 'DISCONTINUED' as const }],
  ])('bỏ qua hộp %s', (_label, variant) => {
    const box = makeBox({ variants: [makeVariant({ id: 'bv9', stockQuantity: 5, ...variant })] })
    expect(chooseBox(EMPTY_DRAFT, entryOf(box))).toBe(EMPTY_DRAFT)
  })

  it('bỏ qua hộp của sản phẩm đã ngừng bán', () => {
    expect(chooseBox(EMPTY_DRAFT, entryOf(makeBox({ status: 'DISCONTINUED' })))).toBe(EMPTY_DRAFT)
  })
})

describe('setItemQuantity', () => {
  it('thêm món mới, cộng dồn và đếm tổng', () => {
    let draft = addItem(withBox, gift)
    draft = addItem(draft, gift)
    draft = setItemQuantity(draft, entryOf(makeGift({ id: 'g2', name: 'Bánh', variants: [makeVariant({ id: 'gv2', productId: 'g2', sku: 'G2', stockQuantity: 10 })] })), 3)
    expect(countItems(draft.items)).toBe(5)
    expect(draft.items).toHaveLength(2)
  })

  it('giới hạn theo tồn kho', () => {
    const limited = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 2, weight: { value: 10, unit: 'G' } })] }))
    expect(setItemQuantity(withBox, limited, 9).items[0]?.quantity).toBe(2)
  })

  it('giới hạn theo tải trọng của hộp (3 kg)', () => {
    const heavy = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 99, weight: { value: 1, unit: 'KG' } })] }))
    expect(setItemQuantity(withBox, heavy, 9).items[0]?.quantity).toBe(3)
  })

  it('giới hạn theo thể tích lòng hộp (22×22×10 cm)', () => {
    const big = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 99, dimensions: { length: 20, width: 20, height: 9, unit: 'CM' } })] }))
    expect(setItemQuantity(withBox, big, 5).items[0]?.quantity).toBe(1)
  })

  it('giới hạn theo số món tối đa', () => {
    const light = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 99 })] }))
    expect(setItemQuantity(withBox, light, MAX_CONTENT_ITEMS + 10).items[0]?.quantity).toBe(MAX_CONTENT_ITEMS)
  })

  it.each([[0], [-3], [Number.NaN], [Number.NEGATIVE_INFINITY]])('số lượng %s bỏ món', (quantity) => {
    expect(setItemQuantity(addItem(withBox, gift), gift, quantity).items).toEqual([])
  })

  it('làm tròn số lượng thập phân xuống', () => {
    expect(setItemQuantity(withBox, gift, 2.9).items[0]?.quantity).toBe(2)
  })

  it('bỏ qua món không mua được', () => {
    const soldOut = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 0 })] }))
    expect(addItem(withBox, soldOut)).toBe(withBox)
  })
})

describe('calcGiftBoxTotal', () => {
  it('bằng 0 khi bản nháp rỗng', () => {
    expect(calcGiftBoxTotal(EMPTY_DRAFT)).toBe(0)
  })

  it('phụ kiện đóng gói miễn phí, thiệp tính giá variant', () => {
    let draft = toggleItem(withBox, entryOf(makeAccessory()))
    draft = toggleItem(draft, entryOf(makeCard()))
    draft = setItemQuantity(draft, gift, 2)
    expect(calcGiftBoxTotal(draft)).toBe(90000 + 0 + 45000 + 2 * 85000)
  })
})

describe('toggleItem', () => {
  it('bật rồi tắt phụ kiện', () => {
    const accessory = entryOf(makeAccessory())
    const on = toggleItem(withBox, accessory)
    expect(on.items).toHaveLength(1)
    expect(toggleItem(on, accessory).items).toEqual([])
  })
})

describe('setCardMessage', () => {
  const card = entryOf(makeCard())
  const withCard = toggleItem(withBox, card)

  it('cắt lời chúc quá dài và đổi cách thể hiện', () => {
    const draft = setCardMessage(withCard, 'k1-v', { messageText: 'a'.repeat(MESSAGE_MAX_LENGTH + 20), messageRenderingMethod: 'PRINTED' })
    const item = draft.items[0]
    expect(item?.messageText).toHaveLength(MESSAGE_MAX_LENGTH)
    expect(item?.messageRenderingMethod).toBe('PRINTED')
  })

  it('không gắn lời chúc vào món không phải thiệp', () => {
    const draft = toggleItem(withBox, entryOf(makeAccessory()))
    expect(setCardMessage(draft, draft.items[0]!.variantId, { messageText: 'x' }).items[0]?.messageText).toBe('')
  })
})

describe('getDraftIssues', () => {
  it('báo thiếu hộp', () => {
    expect(getDraftIssues(EMPTY_DRAFT)).toEqual(['Chưa chọn hộp quà.'])
  })

  it('báo hộp chưa có món (phụ kiện và thiệp không tính là món quà)', () => {
    expect(getDraftIssues(withBox)).toEqual(['Hộp quà chưa có món nào.'])
    expect(countContent(toggleItem(withBox, entryOf(makeAccessory())))).toBe(0)
    expect(getDraftIssues(toggleItem(withBox, entryOf(makeAccessory())))).toContain('Hộp quà chưa có món nào.')
  })

  it('báo quá đầy khi đổi sang hộp nhỏ hơn', () => {
    const heavy = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 99, weight: { value: 1, unit: 'KG' } })] }))
    const draft = setItemQuantity(withBox, heavy, 3)
    const small = makeBox({ variants: [makeVariant({ id: 'bs', productId: 'b1', stockQuantity: 5, giftBoxDetail: { inner: null, maxWeight: { value: 1, unit: 'KG' } } })] })
    expect(getDraftIssues(chooseBox(draft, entryOf(small)))).toEqual([expect.stringContaining('vượt quá xa sức chứa')])
  })

  it('vượt nhẹ không chặn mà chỉ cảnh báo chờ duyệt; còn trống nhiều thì nhắc thêm món', () => {
    const item = entryOf(makeGift({ variants: [makeVariant({ id: 'gv2', stockQuantity: 99, weight: { value: 1, unit: 'KG' } })] }))
    const box = (kg: number) => entryOf(makeBox({ variants: [makeVariant({ id: 'bw', productId: 'b1', stockQuantity: 5, giftBoxDetail: { inner: null, maxWeight: { value: kg, unit: 'KG' } } })] }))
    const over = setItemQuantity(chooseBox(withBox, box(5)), item, 6)
    expect(getDraftIssues(over)).toEqual([])
    expect(getDraftNotice(over)).toMatchObject({ tone: 'warning', text: expect.stringContaining('xem xét') })
    expect(getDraftNotice(setItemQuantity(chooseBox(withBox, box(5)), item, 1))).toMatchObject({ tone: 'info' })
    expect(getDraftNotice(setItemQuantity(chooseBox(withBox, box(5)), item, 4))).toBeNull()
  })

  it('hợp lệ khi có hộp và món', () => {
    expect(getDraftIssues(addItem(withBox, gift))).toEqual([])
  })
})

describe('getDraftPolicy', () => {
  it('lấy tỷ lệ cọc cao nhất và không đổi trả nếu một món không đổi trả', () => {
    const risky = entryOf(makeGift({ variants: [makeVariant({ id: 'gv1', stockQuantity: 5, policy: { isPerishable: true, shelfLifeHours: 24, returnPolicy: 'NO_RETURN', advancePaymentPercent: 50 } })] }))
    expect(getDraftPolicy(addItem(withBox, risky))).toMatchObject({ returnPolicy: 'NO_RETURN', advancePaymentPercent: 50, isPerishable: true })
  })
})

describe('toPayload', () => {
  it('null khi chưa hợp lệ', () => {
    expect(toPayload(withBox)).toBeNull()
  })

  it('chỉ gửi biến thể, số lượng và lời chúc của thiệp — không gửi giá', () => {
    let draft = setItemQuantity(withBox, gift, 2)
    draft = toggleItem(draft, entryOf(makeCard()))
    draft = setCardMessage(draft, 'k1-v', { messageText: '  Chúc mừng!  ', messageRenderingMethod: 'PRINTED' })
    expect(toPayload(draft)).toEqual({
      boxVariantId: 'bv1',
      items: [
        { productVariantId: 'gv1', quantity: 2 },
        { productVariantId: 'k1-v', quantity: 1, messageText: 'Chúc mừng!', messageRenderingMethod: 'PRINTED' },
      ],
    })
  })

  it('bỏ lời chúc toàn khoảng trắng', () => {
    let draft = addItem(withBox, gift)
    draft = toggleItem(draft, entryOf(makeCard()))
    draft = setCardMessage(draft, 'k1-v', { messageText: '    ' })
    expect(toPayload(draft)?.items[1]).toEqual({ productVariantId: 'k1-v', quantity: 1 })
  })
})
