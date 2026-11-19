import { productFormSchema, toFormValues, toProductInput } from '@/features/admin/products/productFormSchema'
import { cartApi } from '@/features/cart/api/cartApi'
import { giftBoxApi } from '@/features/gift-builder/api/giftBoxApi'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { PAYMENT_METHODS } from '@/features/orders/types'
import { productsApi } from '@/features/products/api/productsApi'
import { ADDRESS_IDS, BUNDLE_IDS, VARIANT_IDS as V } from '../data'
import { registerAndSignIn, setupMock, signInAs } from '../testUtils'

const BUNDLE_SAGE_WRAP_KRAFT = BUNDLE_IDS.sageWrapKraft
const order = () => ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod: 'COD' })
const stockOf = async (variantId: string) =>
  (await productsApi.list()).flatMap((p) => p.variants).find((v) => v.id === variantId)?.stockQuantity

describe('mock API · orders', () => {
  beforeEach(setupMock)

  it('chưa đăng nhập → 401', async () => {
    await expect(ordersApi.listMine()).rejects.toMatchObject({ status: 401 })
    await expect(order()).rejects.toMatchObject({ status: 401 })
  })

  describe('khách hàng', () => {
    beforeEach(() => signInAs('customer'))

    it('giỏ rỗng → 400', async () => {
      await expect(order()).rejects.toMatchObject({ status: 400, message: expect.stringContaining('trống') })
    })

    it('đặt hàng: snapshot dòng + thành phần hộp, trừ kho, làm rỗng giỏ, thanh toán PENDING', async () => {
      const box = await giftBoxApi.create({
        boxVariantId: V.boxS,
        items: [
          { productVariantId: V.tea, quantity: 2 },
          { productVariantId: V.wrapKraft, quantity: 1 },
          { productVariantId: V.cardHandwritten, quantity: 1, messageText: 'Chúc mừng!', messageRenderingMethod: 'PRINTED' },
        ],
      })
      await cartApi.addGiftBox(box.id)
      await cartApi.addVariant(V.tea, 1)
      const teaBefore = await stockOf(V.tea)
      const wrapBefore = await stockOf(V.wrapKraft)
      const created = await order()

      expect(created.orderNumber).toMatch(/^GFT-\d{4}$/)
      expect(created.status).toBe('PENDING_CONFIRMATION')
      expect(created.payments).toEqual([expect.objectContaining({ paymentStage: 'FULL_PAYMENT', paymentStatus: 'PENDING', amount: created.totalAmount })])
      expect(created.items).toHaveLength(2)
      expect(created.totalAmount).toBe(created.subtotal + created.shippingFee)

      const boxItem = created.items.find((i) => i.giftBoxConfigId)!
      expect(boxItem).toMatchObject({ productVariantId: null, itemNameSnapshot: 'Hộp quà tùy chỉnh', returnPolicySnapshot: 'RETURNABLE' })
      expect(boxItem.components.map((c) => c.componentRole)).toEqual(['BOX', 'PRODUCT', 'ACCESSORY', 'GREETING_CARD'])
      expect(boxItem.components.find((c) => c.componentRole === 'ACCESSORY')).toMatchObject({ unitPrice: 0, isComplimentary: true, skuSnapshot: 'WRAP-KRAFT' })
      expect(boxItem.components.find((c) => c.componentRole === 'GREETING_CARD')).toMatchObject({ messageText: 'Chúc mừng!', messageRenderingMethod: 'PRINTED' })
      expect(created.items.find((i) => i.productVariantId)).toMatchObject({ skuSnapshot: 'TEA-HERBAL', productId: expect.any(String) })

      expect(await stockOf(V.tea)).toBe((teaBefore ?? 0) - 3)
      expect(await stockOf(V.wrapKraft)).toBe((wrapBefore ?? 0) - 1) // miễn phí nhưng vẫn trừ kho
      expect((await cartApi.get()).items).toEqual([])
      expect((await ordersApi.listMine())[0]?.id).toBe(created.id)
    })

    it('set quà: chỉ trừ kho biến thể set và lựa chọn thêm, không trừ lại thành phần cố định', async () => {
      const [teaBefore, setBefore, cardBefore] = await Promise.all([stockOf(V.tea), stockOf(V.setBirthdaySage), stockOf(V.cardHandwritten)])
      const cart = await cartApi.addVariant(V.setBirthdaySage, 1, [{ bundleOptionId: BUNDLE_SAGE_WRAP_KRAFT }])
      expect(cart.items).toHaveLength(1)
      const wrapBefore = await stockOf(V.wrapKraft)
      await ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod: 'BANK_TRANSFER' }) // set chứa bánh quy → có đặt cọc
      expect(await stockOf(V.setBirthdaySage)).toBe((setBefore ?? 0) - 1)
      expect(await stockOf(V.tea)).toBe(teaBefore) // thành phần cố định của set
      expect(await stockOf(V.cardHandwritten)).toBe(cardBefore)
      expect(await stockOf(V.wrapKraft)).toBe((wrapBefore ?? 0) - 1) // lựa chọn thêm
    })

    it('hàng dễ hỏng: tách khoản đặt cọc và phần còn lại, snapshot chính sách; COD bị từ chối', async () => {
      await cartApi.addVariant(V.cookies, 2) // 190.000₫, cọc 50%, không đổi trả
      await expect(order()).rejects.toMatchObject({ status: 400, message: expect.stringContaining('COD') })

      const created = await ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod: 'BANK_TRANSFER' })
      expect(created.requiredAdvanceAmount).toBe(95000)
      expect(created.payments.map((p) => [p.paymentStage, p.amount])).toEqual([
        ['ADVANCE_PAYMENT', 95000],
        ['REMAINING_PAYMENT', created.totalAmount - 95000],
      ])
      expect(created.items[0]).toMatchObject({
        returnPolicySnapshot: 'NO_RETURN', advancePaymentPercentSnapshot: 50, requiredAdvanceAmount: 95000,
        isPerishableSnapshot: true, shelfLifeHoursSnapshot: 336,
      })
    })

    it('snapshot không đổi khi admin sửa giá sau đó', async () => {
      await cartApi.addVariant(V.tea, 1)
      const created = await order()
      await signInAs('admin')
      const tea = (await productsApi.list()).find((p) => p.variants.some((v) => v.id === V.tea))!
      const input = toProductInput(productFormSchema.parse(toFormValues(tea)))
      await productsApi.update(tea.id, { ...input, variants: input.variants.map((v) => ({ ...v, price: 999000 })) })
      const fromAdmin = (await ordersApi.list()).find((o) => o.id === created.id)!
      expect(fromAdmin.items[0]?.unitPrice).toBe(85000)
    })

    it('tồn kho tính gộp: bút còn 3, hộp dùng 2 + lẻ 2 → 409, không trừ kho', async () => {
      const box = await giftBoxApi.create({ boxVariantId: V.boxS, items: [{ productVariantId: V.pen, quantity: 2 }] })
      await cartApi.addGiftBox(box.id)
      const blocked = await cartApi.addVariant(V.pen, 2).then(
        () => order().then(() => null, (error: unknown) => error),
        (error: unknown) => error,
      )
      expect(blocked).toMatchObject({ status: 409 })
      expect(await stockOf(V.pen)).toBe(3)
    })

    it.each(PAYMENT_METHODS)('chấp nhận phương thức thanh toán %s', async (paymentMethod) => {
      await cartApi.addVariant(V.tea, 1)
      const created = await ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod })
      expect(created.payments[0]).toMatchObject({ paymentMethod, paymentStatus: 'PENDING', paymentStage: 'FULL_PAYMENT' })
    })

    it('địa chỉ không thuộc người dùng / phương thức sai → lỗi', async () => {
      await cartApi.addVariant(V.tea, 1)
      await expect(ordersApi.create({ addressId: 'khong-co', paymentMethod: 'COD' })).rejects.toMatchObject({ status: expect.any(Number) })
      await expect(ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod: 'XYZ' as never })).rejects.toMatchObject({ status: 400 })
    })

    it('không đổi được trạng thái (403) và không xem được toàn bộ đơn (403)', async () => {
      await cartApi.addVariant(V.tea, 1)
      const created = await order()
      await expect(ordersApi.list()).rejects.toMatchObject({ status: 403 })
      await expect(ordersApi.updateStatus(created.id, 'PROCESSING')).rejects.toMatchObject({ status: 403 })
    })

    it('đơn của người này không lộ cho người khác', async () => {
      await cartApi.addVariant(V.tea, 1)
      await order()
      await registerAndSignIn()
      expect(await ordersApi.listMine()).toEqual([])
    })
  })

  describe('quản trị', () => {
    const advance = async (id: string, ...statuses: Parameters<typeof ordersApi.updateStatus>[1][]) => {
      for (const status of statuses) await ordersApi.updateStatus(id, status)
    }
    const placeAs = async (variantId: string, quantity: number, paymentMethod: 'COD' | 'BANK_TRANSFER' = 'COD') => {
      await signInAs('customer')
      await cartApi.addVariant(variantId, quantity)
      const created = await ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod })
      await signInAs('admin')
      return created
    }
    const SHIP = ['CONFIRMED', 'PROCESSING', 'PACKAGING', 'READY_TO_SHIP', 'SHIPPING'] as const

    it('sai luồng → 409, không có đơn → 404', async () => {
      const created = await placeAs(V.tea, 1)
      await expect(ordersApi.updateStatus(created.id, 'DELIVERED')).rejects.toMatchObject({ status: 409 })
      await expect(ordersApi.updateStatus('khong-co', 'CONFIRMED')).rejects.toMatchObject({ status: 404 })
    })

    it('huỷ khi chưa thanh toán: hoàn kho, thanh toán FAILED, không đi tiếp được', async () => {
      const before = await stockOf(V.tea)
      const created = await placeAs(V.tea, 2)
      await advance(created.id, 'CONFIRMED')
      const cancelled = await ordersApi.updateStatus(created.id, 'CANCELLED')
      expect(cancelled.payments[0]?.paymentStatus).toBe('FAILED')
      expect(await stockOf(V.tea)).toBe(before)
      await expect(ordersApi.updateStatus(created.id, 'PROCESSING')).rejects.toMatchObject({ status: 409 })
    })

    it('đi hết luồng: giao xong thanh toán PAID, hoàn thành; admin thấy mọi đơn', async () => {
      const created = await placeAs(V.tea, 1)
      await advance(created.id, ...SHIP)
      expect((await ordersApi.updateStatus(created.id, 'DELIVERED')).payments[0]?.paymentStatus).toBe('PAID')
      expect((await ordersApi.updateStatus(created.id, 'COMPLETED')).status).toBe('COMPLETED')
      expect((await ordersApi.list()).some((o) => o.id === created.id)).toBe(true)
    })

    it('đơn có đặt cọc: cọc PAID khi xác nhận, phần còn lại PAID khi giao; huỷ sau xác nhận hoàn tiền cọc', async () => {
      const created = await placeAs(V.cookies, 2, 'BANK_TRANSFER')
      const confirmed = await ordersApi.updateStatus(created.id, 'CONFIRMED')
      expect(confirmed.payments.map((p) => p.paymentStatus)).toEqual(['PAID', 'PENDING'])
      const cancelled = await ordersApi.updateStatus(created.id, 'CANCELLED')
      expect(cancelled.payments.map((p) => p.paymentStatus)).toEqual(['REFUNDED', 'FAILED'])

      const second = await placeAs(V.cookies, 2, 'BANK_TRANSFER')
      await advance(second.id, ...SHIP)
      const delivered = await ordersApi.updateStatus(second.id, 'DELIVERED')
      expect(delivered.payments.every((p) => p.paymentStatus === 'PAID')).toBe(true)
    })

    it('giao thất bại: hoàn kho và thanh toán FAILED', async () => {
      const before = await stockOf(V.tea)
      const created = await placeAs(V.tea, 2)
      await advance(created.id, ...SHIP)
      expect((await ordersApi.updateStatus(created.id, 'FAILED')).payments[0]?.paymentStatus).toBe('FAILED')
      expect(await stockOf(V.tea)).toBe(before)
    })

    it('trả hàng sau khi đã giao: hoàn kho và hoàn tiền; hoàn kho chỉ một lần', async () => {
      const before = await stockOf(V.tea)
      const created = await placeAs(V.tea, 2)
      await advance(created.id, ...SHIP, 'DELIVERED', 'RETURN_REQUESTED')
      const returned = await ordersApi.updateStatus(created.id, 'RETURNED')
      expect(returned.payments[0]?.paymentStatus).toBe('REFUNDED')
      expect(await stockOf(V.tea)).toBe(before)
      await expect(ordersApi.updateStatus(created.id, 'CANCELLED')).rejects.toMatchObject({ status: 409 })
      expect(await stockOf(V.tea)).toBe(before)
    })

    it('đơn chỉ gồm hàng không đổi trả: không được chuyển sang yêu cầu trả hàng', async () => {
      const created = await placeAs(V.perfume, 1)
      await advance(created.id, ...SHIP, 'DELIVERED')
      await expect(ordersApi.updateStatus(created.id, 'RETURN_REQUESTED')).rejects.toMatchObject({ status: 409 })
    })
  })
})
