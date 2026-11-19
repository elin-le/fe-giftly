import { cartApi } from '@/features/cart/api/cartApi'
import { giftBoxApi } from '@/features/gift-builder/api/giftBoxApi'
import { BUNDLE_IDS as B, VARIANT_IDS as V } from '../data'
import { registerAndSignIn, setupMock, signInAs } from '../testUtils'

const makeBox = () => giftBoxApi.create({ boxVariantId: V.boxS, items: [{ productVariantId: V.tea, quantity: 1 }] })

describe('mock API · cart', () => {
  beforeEach(setupMock)

  it('chưa đăng nhập: không xem / thêm được giỏ (401)', async () => {
    await expect(cartApi.get()).rejects.toMatchObject({ status: 401 })
    await expect(cartApi.addVariant(V.tea, 1)).rejects.toMatchObject({ status: 401 })
    await expect(cartApi.addGiftBox('x')).rejects.toMatchObject({ status: 401 })
  })

  describe('đã đăng nhập', () => {
    beforeEach(() => signInAs('customer'))

    it('giỏ ban đầu rỗng, phí ship 0, không đặt cọc', async () => {
      const cart = await cartApi.get()
      expect(cart.items).toEqual([])
      expect(cart.shippingFee).toBe(0)
      expect(cart.totalAmount).toBe(0)
      expect(cart.requiredAdvanceAmount).toBe(0)
    })

    it('thêm biến thể: cộng dồn số lượng và tính tiền', async () => {
      await cartApi.addVariant(V.tea, 1)
      const cart = await cartApi.addVariant(V.tea, 2)
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0]?.quantity).toBe(3)
      expect(cart.subtotal).toBe(3 * 85000)
      expect(cart.totalAmount).toBe(cart.subtotal + cart.shippingFee)
    })

    it('hai biến thể của cùng sản phẩm là hai dòng, mỗi dòng có giá riêng', async () => {
      await cartApi.addVariant(V.candle100, 1)
      const cart = await cartApi.addVariant(V.candle200, 1)
      expect(cart.items.map((i) => i.unitPrice)).toEqual([185000, 295000])
      expect(cart.items.map((i) => i.variant?.optionLabel)).toEqual(['100g', '200g'])
    })

    it.each([[0], [-1], [1.5]])('từ chối số lượng %s', async (quantity) => {
      await expect(cartApi.addVariant(V.tea, quantity)).rejects.toMatchObject({ status: 400 })
    })

    it('từ chối biến thể không tồn tại, vượt tồn kho, đã ngừng bán', async () => {
      await expect(cartApi.addVariant('khong-co', 1)).rejects.toMatchObject({ status: 404 })
      await expect(cartApi.addVariant(V.pen, 4)).rejects.toMatchObject({ status: 409, message: expect.stringContaining('chỉ còn 3') })
      await expect(cartApi.addVariant(V.setHoliday, 1)).rejects.toMatchObject({ status: 404 })
    })

    it('hàng dễ hỏng: dòng giỏ có đặt cọc 50% và không đổi trả', async () => {
      const cart = await cartApi.addVariant(V.cookies, 2)
      expect(cart.items[0]).toMatchObject({ returnPolicy: 'NO_RETURN', advancePaymentPercent: 50, advanceAmount: 95000 })
      expect(cart.requiredAdvanceAmount).toBe(95000)
    })

    describe('set quà', () => {
      it('giá = giá set + lựa chọn tính phí; thiệp miễn phí cộng 0; chính sách lấy cao nhất của thành phần', async () => {
        const cart = await cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardPopup, messageText: ' Chúc mừng ', messageRenderingMethod: 'PRINTED' }])
        const [line] = cart.items
        expect(line?.unitPrice).toBe(450000 + 20000)
        expect(line?.selections[0]).toMatchObject({ messageText: 'Chúc mừng', messageRenderingMethod: 'PRINTED', unitPrice: 20000 })
        expect(line).toMatchObject({ returnPolicy: 'NO_RETURN', advancePaymentPercent: 50, advanceAmount: 235000 })

        const free = await cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardHandwritten }])
        expect(free.items[1]?.unitPrice).toBe(450000)
      })

      it('cùng set nhưng khác lựa chọn là hai dòng; trùng hệt thì gộp', async () => {
        await cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardHandwritten }])
        await cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardPopup }])
        const cart = await cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardHandwritten }])
        expect(cart.items.map((i) => i.quantity)).toEqual([2, 1])
      })

      it('nhóm bắt buộc phải được chọn; lựa chọn không thuộc set / số lượng sai bị từ chối', async () => {
        await expect(cartApi.addVariant(V.setAnniversary, 1)).rejects.toMatchObject({ status: 400, message: expect.stringContaining('Thiệp chúc mừng') })
        await expect(cartApi.addVariant(V.setAnniversary, 1, [{ bundleOptionId: B.pinkCardPopup }])).rejects.toMatchObject({ status: 400 })
        await expect(cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardPopup, quantity: 2 }])).rejects.toMatchObject({ status: 400 })
        await expect(cartApi.addVariant(V.tea, 1, [{ bundleOptionId: B.pinkCardPopup }])).rejects.toMatchObject({ status: 400 })
      })

      it('chọn nhiều hơn mức tối đa của nhóm SINGLE bị từ chối; lời chúc quá dài bị từ chối', async () => {
        await expect(cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardHandwritten }, { bundleOptionId: B.pinkCardPopup }])).rejects.toMatchObject({ status: 400 })
        await expect(cartApi.addVariant(V.setBirthdayPinkS, 1, [{ bundleOptionId: B.pinkCardHandwritten, messageText: 'a'.repeat(201) }])).rejects.toMatchObject({ status: 400 })
      })

      it('lời chúc chỉ dành cho thiệp, không gắn vào giấy gói', async () => {
        await expect(cartApi.addVariant(V.setBirthdaySage, 1, [{ bundleOptionId: B.sageWrapKraft, messageText: 'x' }])).rejects.toMatchObject({ status: 400 })
      })
    })

    it('thêm hộp quà tùy chỉnh; không thêm trùng cùng cấu hình', async () => {
      const box = await makeBox()
      const cart = await cartApi.addGiftBox(box.id)
      expect(cart.items[0]?.giftBox?.id).toBe(box.id)
      expect(cart.items[0]?.quantity).toBe(1)
      await expect(cartApi.addGiftBox(box.id)).rejects.toMatchObject({ status: 409 })
    })

    it('hộp quà không tồn tại → 404; luôn số lượng 1', async () => {
      await expect(cartApi.addGiftBox('khong-co')).rejects.toMatchObject({ status: 404 })
      const cart = await cartApi.addGiftBox((await makeBox()).id)
      await expect(cartApi.setQuantity(cart.items[0]?.id ?? '', 2)).rejects.toMatchObject({ status: 400 })
    })

    it('sửa số lượng (có kiểm tồn kho), xoá dòng; xoá dòng không có → 404', async () => {
      const added = await cartApi.addVariant(V.tea, 1)
      const id = added.items[0]?.id ?? ''
      expect((await cartApi.setQuantity(id, 4)).items[0]?.quantity).toBe(4)
      await expect(cartApi.setQuantity(id, 0)).rejects.toMatchObject({ status: 400 })
      await expect(cartApi.setQuantity(id, 999)).rejects.toMatchObject({ status: 409 })
      expect((await cartApi.removeItem(id)).items).toEqual([])
      await expect(cartApi.removeItem(id)).rejects.toMatchObject({ status: 404 })
    })

    it('giỏ của mỗi người dùng tách biệt; không dùng được cấu hình hộp của người khác', async () => {
      const box = await makeBox()
      await cartApi.addVariant(V.tea, 1)
      await registerAndSignIn()
      expect((await cartApi.get()).items).toEqual([])
      await expect(cartApi.addGiftBox(box.id)).rejects.toMatchObject({ status: 404 })
    })
  })
})
