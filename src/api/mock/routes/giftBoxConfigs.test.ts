import { useAuthStore } from '@/stores/authStore'
import { giftBoxApi } from '@/features/gift-builder/api/giftBoxApi'
import { MAX_CONTENT_ITEMS } from '@/features/gift-builder/constants'
import type { GiftBoxPayload } from '@/features/gift-builder/types'
import { VARIANT_IDS as V } from '../data'
import { setupMock, signInAs } from '../testUtils'

const valid: GiftBoxPayload = {
  boxVariantId: V.boxM,
  items: [
    { productVariantId: V.tea, quantity: 2 },
    { productVariantId: V.notebookBrown, quantity: 1 },
    { productVariantId: V.wrapKraft, quantity: 1 },
    { productVariantId: V.cardHandwritten, quantity: 1, messageText: '  Chúc mừng!  ', messageRenderingMethod: 'PRINTED' },
  ],
}

describe('mock API · gift-box-configs', () => {
  beforeEach(async () => {
    setupMock()
    await signInAs('customer')
  })

  it('giá do server tính: phụ kiện đóng gói miễn phí, thiệp tính theo giá biến thể', async () => {
    const view = await giftBoxApi.create(valid)
    expect(view.price).toBe(90000 + 2 * 85000 + 120000 + 0 + 45000)
    expect(view.box).toMatchObject({ role: 'BOX', unitPrice: 90000 })
    expect(view.items.map((i) => i.role)).toEqual(['PRODUCT', 'PRODUCT', 'ACCESSORY', 'GREETING_CARD'])
    expect(view.items[2]).toMatchObject({ unitPrice: 0, isComplimentary: true, listPrice: 25000 })
    expect(view.items[3]).toMatchObject({ messageText: 'Chúc mừng!', messageRenderingMethod: 'PRINTED' })
  })

  it('thiệp có lời chúc mặc định viết tay; không lời chúc thì để null', async () => {
    const view = await giftBoxApi.create({ boxVariantId: V.boxS, items: [{ productVariantId: V.cardHandwritten, quantity: 1, messageText: 'Hi' }, { productVariantId: V.tea, quantity: 1 }] })
    expect(view.items[0]).toMatchObject({ messageText: 'Hi', messageRenderingMethod: 'HANDWRITTEN' })
    expect(view.items[1]).toMatchObject({ messageText: null, messageRenderingMethod: null })
  })

  it('chính sách gộp: món NO_RETURN làm cả hộp NO_RETURN, đặt cọc lấy tỷ lệ cao nhất', async () => {
    const plain = await giftBoxApi.create(valid)
    expect(plain).toMatchObject({ returnPolicy: 'RETURNABLE', advancePaymentPercent: 0 })
    const withCookies = await giftBoxApi.create({ boxVariantId: V.boxM, items: [{ productVariantId: V.cookies, quantity: 1 }, { productVariantId: V.perfume, quantity: 1 }] })
    expect(withCookies).toMatchObject({ returnPolicy: 'NO_RETURN', advancePaymentPercent: 50 })
  })

  it('cho phép hộp quà bán riêng làm món trong hộp', async () => {
    const view = await giftBoxApi.create({ boxVariantId: V.boxL, items: [{ productVariantId: V.boxS, quantity: 1 }] })
    expect(view.items[0]).toMatchObject({ productType: 'READY_MADE_GIFT_BOX', role: 'PRODUCT' })
  })

  it('yêu cầu đăng nhập (401)', async () => {
    useAuthStore.getState().signOut()
    await expect(giftBoxApi.create(valid)).rejects.toMatchObject({ status: 401 })
  })

  it.each([
    ['hộp chứa không phải hộp quà', { boxVariantId: V.tea }, 400, 'Hộp quà không hợp lệ'],
    ['hộp chứa không tồn tại', { boxVariantId: 'khong-co' }, 400, 'Hộp quà không hợp lệ'],
    ['không có món', { items: [] }, 400, 'chưa có món'],
    ['món không tồn tại', { items: [{ productVariantId: 'khong-co', quantity: 1 }] }, 400, 'không thể đưa vào'],
    ['set quà lồng trong hộp', { items: [{ productVariantId: V.setBirthdaySage, quantity: 1 }] }, 400, 'set quà'],
    ['sản phẩm lẻ không đủ điều kiện', { items: [{ productVariantId: V.driedFlowers, quantity: 1 }] }, 400, 'không dùng được'],
    ['món trùng lặp', { items: [{ productVariantId: V.tea, quantity: 1 }, { productVariantId: V.tea, quantity: 1 }] }, 400, 'trùng'],
    ['số lượng 0', { items: [{ productVariantId: V.tea, quantity: 0 }] }, 400, 'Số lượng'],
    ['số lượng thập phân', { items: [{ productVariantId: V.tea, quantity: 1.5 }] }, 400, 'Số lượng'],
    ['vượt giới hạn số món', { items: [{ productVariantId: V.wrapKraft, quantity: MAX_CONTENT_ITEMS + 1 }] }, 400, 'sức chứa'],
    ['lời chúc quá dài', { items: [{ productVariantId: V.cardHandwritten, quantity: 1, messageText: 'a'.repeat(201) }] }, 400, 'Lời chúc'],
    ['lời chúc gắn vào món không phải thiệp', { items: [{ productVariantId: V.tea, quantity: 1, messageText: 'x' }] }, 400, 'Chỉ thiệp'],
    ['vượt thể tích lòng hộp (hộp S)', { boxVariantId: V.boxS, items: [{ productVariantId: V.candle200, quantity: 3 }] }, 400, 'sức chứa'],
    ['vượt tải trọng (hộp S 1,5 kg)', { boxVariantId: V.boxS, items: [{ productVariantId: V.cookies, quantity: 6 }] }, 400, 'sức chứa'],
    ['món hết hàng', { items: [{ productVariantId: V.ribbonGold, quantity: 1 }] }, 409, 'hết hàng'],
    ['vượt tồn kho (bút còn 3)', { items: [{ productVariantId: V.pen, quantity: 4 }] }, 409, 'chỉ còn 3'],
  ])('từ chối khi %s', async (_label, override, status, text) => {
    await expect(giftBoxApi.create({ ...valid, ...override })).rejects.toMatchObject({ status, message: expect.stringContaining(text) })
  })
})

describe('mock API · hộp vượt kích thước (cần admin duyệt)', () => {
  // Hộp S: lòng 15×15×8 cm = 1800 cm³; bánquy 900 + sổ 630 + nến 576 = 2106 cm³ → vượt ~17%.
  const slightlyOver: GiftBoxPayload = {
    boxVariantId: V.boxS,
    items: [{ productVariantId: V.cookies, quantity: 1 }, { productVariantId: V.notebookBrown, quantity: 1 }, { productVariantId: V.candle100, quantity: 1 }],
  }
  const wayOver: GiftBoxPayload = { boxVariantId: V.boxS, items: [{ productVariantId: V.cookies, quantity: 2 }, { productVariantId: V.tea, quantity: 1 }] }

  beforeEach(() => setupMock())

  it('vượt nhẹ: vẫn tạo được, trạng thái chờ duyệt kèm lý do', async () => {
    await signInAs('customer')
    const view = await giftBoxApi.create(slightlyOver)
    expect(view.reviewStatus).toBe('PENDING')
    expect(view.reviewNote).toMatch(/Vượt sức chứa/)
    expect(view.capacityRatio).toBeGreaterThan(1)
  })

  it('vừa hộp thì không cần duyệt; vượt quá dung sai thì bị từ chối', async () => {
    await signInAs('customer')
    expect((await giftBoxApi.create({ boxVariantId: V.boxM, items: [{ productVariantId: V.tea, quantity: 2 }] })).reviewStatus).toBe('NOT_REQUIRED')
    await expect(giftBoxApi.create(wayOver)).rejects.toThrow(/vượt quá xa/)
  })

  it('khách sửa được khi chưa duyệt (đưa về vừa thì hết cần duyệt)', async () => {
    await signInAs('customer')
    const view = await giftBoxApi.create(slightlyOver)
    const fixed = await giftBoxApi.update(view.id, { boxVariantId: V.boxM, items: slightlyOver.items })
    expect(fixed).toMatchObject({ id: view.id, reviewStatus: 'NOT_REQUIRED' })
  })

  it('admin thấy yêu cầu chờ duyệt kèm liên hệ khách; khách thường không xem được', async () => {
    await signInAs('customer')
    await giftBoxApi.create(slightlyOver)
    await expect(giftBoxApi.listRequests()).rejects.toThrow()
    await signInAs('admin')
    const [request] = await giftBoxApi.listRequests()
    expect(request).toMatchObject({ customer: { phone: '0901234567' }, view: { reviewStatus: 'PENDING' } })
  })

  it('từ chối phải có lý do; duyệt xong khách không sửa được nữa', async () => {
    await signInAs('customer')
    const view = await giftBoxApi.create(slightlyOver)
    await signInAs('admin')
    await expect(giftBoxApi.decide(view.id, { decision: 'REJECTED' })).rejects.toThrow(/lý do/)
    const rejected = await giftBoxApi.decide(view.id, { decision: 'REJECTED', note: 'Vui lòng bớt 1 món' })
    expect(rejected.view).toMatchObject({ reviewStatus: 'REJECTED', reviewNote: 'Vui lòng bớt 1 món' })
    await giftBoxApi.decide(view.id, { decision: 'APPROVED' })
    await signInAs('customer')
    await expect(giftBoxApi.update(view.id, wayOver)).rejects.toThrow(/đã được duyệt/)
  })
})
