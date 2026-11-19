import { ordersApi } from '@/features/orders/api/ordersApi'
import { reviewsApi } from '@/features/orders/api/reviewsApi'
import { productsApi } from '@/features/products/api/productsApi'
import { cartApi } from '@/features/cart/api/cartApi'
import { ADDRESS_IDS, PRODUCT_IDS as P, VARIANT_IDS as V } from '../data'
import { registerAndSignIn, setupMock, signInAs } from '../testUtils'

const SEED_COMPLETED = async () => (await ordersApi.listMine()).find((o) => o.status === 'COMPLETED')!
const SEED_PENDING = async () => (await ordersApi.listMine()).find((o) => o.status === 'PENDING_CONFIRMATION')!

describe('mock API · đánh giá', () => {
  beforeEach(setupMock)

  it('ai cũng đọc được đánh giá của sản phẩm; điểm trung bình gộp mọi biến thể', async () => {
    const reviews = await reviewsApi.listForProduct(P.notebook)
    expect(reviews).toHaveLength(1)
    const notebook = (await productsApi.list()).find((p) => p.id === P.notebook)
    expect(notebook).toMatchObject({ ratingAverage: 5, reviewCount: 1 })
  })

  it('chưa đăng nhập không gửi được đánh giá (401)', async () => {
    await expect(reviewsApi.create({ orderItemId: 'x', rating: 5 })).rejects.toMatchObject({ status: 401 })
  })

  describe('đã đăng nhập', () => {
    beforeEach(() => signInAs('customer'))

    it('đánh giá dòng đơn đã hoàn thành; cập nhật điểm trung bình theo sản phẩm', async () => {
      const item = (await SEED_COMPLETED()).items.find((i) => i.productVariantId === V.candle200)!
      const review = await reviewsApi.create({ orderItemId: item.id, rating: 3, title: '  Ổn  ', comment: 'Hương nhẹ' })
      expect(review).toMatchObject({ productId: P.candle, productVariantId: V.candle200, rating: 3, title: 'Ổn' })
      expect((await reviewsApi.mine()).map((r) => r.id)).toContain(review.id)
      expect((await productsApi.list()).find((p) => p.id === P.candle)).toMatchObject({ ratingAverage: 3, reviewCount: 1 })
    })

    it('mỗi nguồn mua chỉ đánh giá một lần (409)', async () => {
      const item = (await SEED_COMPLETED()).items.find((i) => i.productVariantId === V.notebookBrown)!
      await expect(reviewsApi.create({ orderItemId: item.id, rating: 4 })).rejects.toMatchObject({ status: 409 })
    })

    it('đơn chưa giao thì không đánh giá được (409)', async () => {
      const item = (await SEED_PENDING()).items[0]!
      await expect(reviewsApi.create({ orderItemId: item.id, rating: 5 })).rejects.toMatchObject({ status: 409 })
    })

    it('dòng set/hộp không gắn sản phẩm: phải đánh giá từng thành phần', async () => {
      const component = (await SEED_PENDING()).items[0]!.components[0]!
      await expect(reviewsApi.create({ orderItemComponentId: component.id, rating: 5 })).rejects.toMatchObject({ status: 409 })
    })

    it.each([[0], [6], [3.5]])('từ chối điểm %s (400)', async (rating) => {
      const item = (await SEED_COMPLETED()).items[1]!
      await expect(reviewsApi.create({ orderItemId: item.id, rating })).rejects.toMatchObject({ status: 400 })
    })

    it('cần đúng một nguồn mua; nguồn không tồn tại → 404', async () => {
      await expect(reviewsApi.create({ rating: 5 })).rejects.toMatchObject({ status: 400 })
      await expect(reviewsApi.create({ orderItemId: 'a', orderItemComponentId: 'b', rating: 5 })).rejects.toMatchObject({ status: 400 })
      await expect(reviewsApi.create({ orderItemId: 'khong-co', rating: 5 })).rejects.toMatchObject({ status: 404 })
    })

    it('đơn vừa đặt và đã giao thì đánh giá được, gắn đúng sản phẩm và biến thể', async () => {
      await cartApi.addVariant(V.tea, 1)
      const placed = await ordersApi.create({ addressId: ADDRESS_IDS.home, paymentMethod: 'COD' })
      await signInAs('admin')
      for (const status of ['CONFIRMED', 'PROCESSING', 'PACKAGING', 'READY_TO_SHIP', 'SHIPPING', 'DELIVERED'] as const) {
        await ordersApi.updateStatus(placed.id, status)
      }
      await signInAs('customer')
      const item = placed.items[0]!
      const review = await reviewsApi.create({ orderItemId: item.id, rating: 4 })
      expect(review).toMatchObject({ productId: P.tea, productVariantId: V.tea })
    })

    it('người khác không đánh giá được đơn không phải của mình (404)', async () => {
      const item = (await SEED_COMPLETED()).items[1]!
      await registerAndSignIn()
      await expect(reviewsApi.create({ orderItemId: item.id, rating: 5 })).rejects.toMatchObject({ status: 404 })
    })
  })
})
