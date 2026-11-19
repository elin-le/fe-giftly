import { productsApi } from '@/features/products/api/productsApi'
import { apiClient } from '../../client'
import { CATEGORY_IDS, PRODUCT_IDS, VARIANT_IDS } from '../data'
import { registerAndSignIn, setupMock, signInAs } from '../testUtils'

const variantInput = (override: object = {}) => ({
  sku: 'X', price: 1000, stockQuantity: 1, status: 'AVAILABLE', optionValueIds: [],
  dimensions: null, weight: null, policy: null, giftBoxDetail: null, bundle: null, ...override,
})

const validInput = {
  categoryId: CATEGORY_IDS.food,
  name: 'Socola đen',
  description: 'Socola 70% cacao',
  productType: 'REGULAR',
  status: 'AVAILABLE',
  isCustomBoxEligible: false,
  images: [],
  options: [],
  variants: [variantInput({ sku: 'CHOC-70', price: 99000, stockQuantity: 10 })],
}

describe('mock API · danh mục & sản phẩm', () => {
  beforeEach(setupMock)

  it('ai cũng xem được danh mục và sản phẩm (không cần đăng nhập)', async () => {
    expect((await apiClient.get('/categories')).data.length).toBeGreaterThan(0)
    const { data } = await apiClient.get('/products')
    expect(data[0]).toMatchObject({ id: expect.any(String), images: expect.any(Array), productType: expect.any(String), variants: expect.any(Array) })
  })

  it('tìm theo tên hoặc mô tả, không phân biệt hoa/thường; lọc theo danh mục', async () => {
    const byName = (await apiClient.get('/products', { params: { search: 'TRÀ' } })).data
    expect(byName.map((p: { name: string }) => p.name)).toContain('Trà thảo mộc')

    const byDescription = (await apiClient.get('/products', { params: { search: 'cacao' } })).data
    expect(byDescription).toEqual([])

    const byType = (await apiClient.get('/products', { params: { productType: 'GREETING_CARD' } })).data
    expect(byType.map((p: { name: string }) => p.name).sort()).toEqual(['Thiệp pop-up', 'Thiệp viết tay Giftly'])

    const byCategory = (await apiClient.get('/products', { params: { categoryId: CATEGORY_IDS.boxes } })).data
    expect(byCategory).toHaveLength(2)
  })

  it('thao tác ghi yêu cầu đăng nhập (401) và quyền ADMIN (403)', async () => {
    await expect(apiClient.post('/products', validInput)).rejects.toMatchObject({ status: 401 })
    await signInAs('customer')
    await expect(apiClient.post('/products', validInput)).rejects.toMatchObject({ status: 403 })
    await expect(apiClient.delete(`/products/${PRODUCT_IDS.tea}`)).rejects.toMatchObject({ status: 403 })
  })

  it('admin tạo, sửa, xoá sản phẩm', async () => {
    await signInAs('admin')
    const created = (await apiClient.post('/products', validInput)).data
    expect(created).toMatchObject({ name: 'Socola đen', images: [] })

    const variantId = created.variants[0].id
    const edited = { ...validInput, variants: [variantInput({ id: variantId, sku: 'CHOC-70', price: 120000, stockQuantity: 10 })] }
    const updated = (await apiClient.put(`/products/${created.id}`, edited)).data
    expect(updated.variants[0].price).toBe(120000)

    expect((await apiClient.delete(`/products/${created.id}`)).status).toBe(204)
    const all = (await apiClient.get('/products')).data
    expect(all.some((p: { id: string }) => p.id === created.id)).toBe(false)
  })

  it.each([
    ['tên trống', { name: '  ' }],
    ['giá không phải số nguyên dương', { variants: [variantInput({ price: 0 })] }],
    ['tồn kho âm', { variants: [variantInput({ stockQuantity: -1 })] }],
    ['không có biến thể', { variants: [] }],
    ['SKU trùng với biến thể có sẵn', { variants: [variantInput({ sku: 'TEA-HERBAL' })] }],
    ['danh mục không tồn tại', { categoryId: 'khong-co' }],
    ['loại sản phẩm lạ', { productType: 'KHAC' }],
  ])('từ chối dữ liệu không hợp lệ: %s (400)', async (_label, override) => {
    await signInAs('admin')
    await expect(apiClient.post('/products', { ...validInput, ...override })).rejects.toMatchObject({ status: 400 })
  })

  it('sửa/xoá sản phẩm không tồn tại trả 404', async () => {
    await signInAs('admin')
    await expect(apiClient.put('/products/khong-co', validInput)).rejects.toMatchObject({ status: 404 })
    await expect(apiClient.delete('/products/khong-co')).rejects.toMatchObject({ status: 404 })
  })

  it('người dùng mới đăng ký cũng không có quyền admin', async () => {
    await registerAndSignIn()
    await expect(apiClient.post('/products', validInput)).rejects.toMatchObject({ status: 403 })
  })

  describe('admin quản lý đầy đủ (ảnh, tuỳ chọn, biến thể, set)', () => {
    const color = { id: '11111111-0000-4000-8000-000000000001', name: 'Màu', values: [
      { id: '11111111-0000-4000-8000-0000000000a1', value: 'Hồng', colorHex: '#E8A5B5' },
      { id: '11111111-0000-4000-8000-0000000000a2', value: 'Xanh', colorHex: null },
    ] }
    const withOptions = {
      ...validInput, name: 'Gấu bông', options: [color],
      variants: [
        variantInput({ sku: 'TED-PINK', optionValueIds: [color.values[0]!.id], dimensions: { length: 20, width: 15, height: 10, unit: 'CM' }, weight: { value: 300, unit: 'G' } }),
        variantInput({ sku: 'TED-BLUE', price: 150000, optionValueIds: [color.values[1]!.id] }),
      ],
    }

    it('tạo sản phẩm nhiều biến thể kèm tuỳ chọn, ảnh và chính sách', async () => {
      await signInAs('admin')
      const policy = { isPerishable: true, shelfLifeHours: 48, returnPolicy: 'NO_RETURN', advancePaymentPercent: 50 }
      const images = [{ imageUrl: 'https://cdn.example.com/a.jpg', isThumbnail: false, productVariantId: null }]
      const body = { ...withOptions, images, variants: [{ ...withOptions.variants[0]!, policy }, withOptions.variants[1]!] }
      const created = (await apiClient.post('/products', body)).data
      expect(created.variants).toHaveLength(2)
      expect(created.options[0]).toMatchObject({ name: 'Màu', displayOrder: 1 })
      expect(created.variants[0]).toMatchObject({ policy, weight: { value: 300, unit: 'G' } })
      expect(created.images[0]).toMatchObject({ secureUrl: 'https://cdn.example.com/a.jpg', isThumbnail: true })

      const fetched = (await apiClient.get(`/products/${created.id}`)).data
      expect(fetched.variants.map((v: { sku: string }) => v.sku)).toEqual(['TED-PINK', 'TED-BLUE'])
    })

    it('sửa: thêm biến thể mới, giữ id biến thể cũ; xoá biến thể chưa có đơn', async () => {
      await signInAs('admin')
      const created = (await apiClient.post('/products', withOptions)).data
      const [pink, blue] = created.variants
      const third = { id: '11111111-0000-4000-8000-0000000000a3', value: 'Vàng', colorHex: null }
      const edited = {
        ...withOptions, options: [{ ...color, values: [...color.values, third] }],
        variants: [variantInput({ id: pink.id, sku: 'TED-PINK', optionValueIds: [color.values[0]!.id] }), variantInput({ sku: 'TED-YELLOW', optionValueIds: [third.id] })],
      }
      const updated = (await apiClient.put(`/products/${created.id}`, edited)).data
      expect(updated.variants.map((v: { sku: string }) => v.sku)).toEqual(['TED-PINK', 'TED-YELLOW'])
      expect(updated.variants[0].id).toBe(pink.id)
      expect(updated.variants.some((v: { id: string }) => v.id === blue.id)).toBe(false)
    })

    it('không xoá biến thể hoặc sản phẩm đã có trong đơn hàng (409)', async () => {
      await signInAs('admin')
      await expect(apiClient.delete(`/products/${PRODUCT_IDS.notebook}`)).rejects.toMatchObject({ status: 409 })
      const notebook = (await apiClient.get(`/products/${PRODUCT_IDS.notebook}`)).data
      const first = notebook.variants[1] // chỉ giữ bản Đen, bỏ bản Nâu đã có trong đơn
      const body = { ...validInput, name: notebook.name, categoryId: notebook.categoryId, isCustomBoxEligible: true, options: notebook.options,
        variants: [variantInput({ id: first.id, sku: first.sku, optionValueIds: first.optionValueIds })] }
      await expect(apiClient.put(`/products/${PRODUCT_IDS.notebook}`, body)).rejects.toMatchObject({ status: 409 })
    })

    it.each([
      ['hàng dễ hỏng cho đổi trả', { policy: { isPerishable: true, shelfLifeHours: 24, returnPolicy: 'RETURNABLE', advancePaymentPercent: 50 } }],
      ['hàng dễ hỏng cọc dưới 50%', { policy: { isPerishable: true, shelfLifeHours: 24, returnPolicy: 'NO_RETURN', advancePaymentPercent: 20 } }],
      ['cọc quá 100%', { policy: { isPerishable: false, shelfLifeHours: null, returnPolicy: null, advancePaymentPercent: 120 } }],
      ['lòng hộp ở sản phẩm không phải hộp', { giftBoxDetail: { inner: { length: 1, width: 1, height: 1, unit: 'CM' }, maxWeight: null } }],
      ['kích thước thiếu chiều', { dimensions: { length: 1, width: 0, height: 1, unit: 'CM' } }],
    ])('từ chối %s (400)', async (_label, override) => {
      await signInAs('admin')
      await expect(apiClient.post('/products', { ...validInput, variants: [variantInput(override)] })).rejects.toMatchObject({ status: 400 })
    })

    it('set quà: lưu thành phần, nhóm tuỳ chọn; từ chối thành phần sai loại', async () => {
      await signInAs('admin')
      const setBody = (bundle: object) => ({ ...validInput, name: 'Set mới', productType: 'READY_MADE_GIFT_SET', variants: [variantInput({ sku: 'SET-NEW', bundle })] })
      const bundle = {
        components: [{ componentVariantId: VARIANT_IDS.boxM, componentRole: 'BOX', quantity: 1, isRequired: true }, { componentVariantId: VARIANT_IDS.tea, componentRole: 'PRODUCT', quantity: 2, isRequired: true }],
        optionGroups: [{ name: 'Thiệp', groupType: 'GREETING_CARD', selectionType: 'SINGLE', minSelections: 1, maxSelections: 1, isRequired: true,
          options: [{ productVariantId: VARIANT_IDS.cardHandwritten, pricingMode: 'FREE', fixedPrice: null }, { productVariantId: VARIANT_IDS.cardPopup, pricingMode: 'FIXED_PRICE', fixedPrice: 20000 }] }],
      }
      const created = (await apiClient.post('/products', setBody(bundle))).data
      const stored = (await apiClient.get(`/products/${created.id}`)).data.variants[0].bundle
      expect(stored.components.map((c: { productName: string }) => c.productName)).toEqual(['Hộp quà Giftly', 'Trà thảo mộc'])
      expect(stored.optionGroups[0].options.map((o: { price: number }) => o.price)).toEqual([0, 20000])

      const wrongRole = { ...bundle, components: [{ componentVariantId: VARIANT_IDS.tea, componentRole: 'BOX', quantity: 1, isRequired: true }] }
      await expect(apiClient.post('/products', setBody(wrongRole))).rejects.toMatchObject({ status: 400 })
    })
  })
})

describe('mock API · sản phẩm hot', () => {
  beforeEach(() => setupMock())

  it('GET /products/featured chỉ trả sản phẩm còn bán, tối đa `limit`', async () => {
    const list = await productsApi.featured(3)
    expect(list.length).toBeLessThanOrEqual(3)
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((p) => p.status !== 'DISCONTINUED' && p.variants.some((v) => v.stockQuantity > 0))).toBe(true)
  })
})
