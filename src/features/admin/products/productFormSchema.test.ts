import { seedProducts } from '@/api/mock/data'
import { resolveProducts } from '@/api/mock/catalogView'
import { createDb } from '@/api/mock/db'
import {
  EMPTY_PRODUCT_FORM,
  emptyVariantForm,
  productFormSchema,
  toFormValues,
  toProductInput,
  type ProductFormInput,
  type VariantFormInput,
} from './productFormSchema'

const variant = (override: Partial<VariantFormInput> = {}): VariantFormInput =>
  emptyVariantForm({ sku: 'CANDLE-100', price: '185000', stockQuantity: '10', ...override })
const valid: ProductFormInput = {
  ...EMPTY_PRODUCT_FORM, name: 'Nến thơm', description: 'Hương nhài', categoryId: 'c1', isCustomBoxEligible: true, variants: [variant()],
}
const withVariant = (override: Partial<VariantFormInput>, extra: Partial<ProductFormInput> = {}) => ({ ...valid, ...extra, variants: [variant(override)] })
const messages = (input: unknown) => {
  const result = productFormSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
}

describe('productFormSchema', () => {
  it('ép giá và tồn kho của biến thể từ chuỗi sang số', () => {
    const result = productFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.variants[0]).toMatchObject({ price: 185000, stockQuantity: 10 })
  })

  it('từ chối giá thấp, giá thập phân, giá không phải số', () => {
    for (const price of ['500', '1500.5', 'abc']) expect(productFormSchema.safeParse(withVariant({ price })).success).toBe(false)
  })

  it('từ chối tồn kho âm hoặc thập phân nhưng cho phép 0', () => {
    expect(productFormSchema.safeParse(withVariant({ stockQuantity: '-1' })).success).toBe(false)
    expect(productFormSchema.safeParse(withVariant({ stockQuantity: '2.5' })).success).toBe(false)
    expect(productFormSchema.safeParse(withVariant({ stockQuantity: '0' })).success).toBe(true)
  })

  it('yêu cầu danh mục, tên hợp lệ và ít nhất một biến thể', () => {
    expect(productFormSchema.safeParse({ ...valid, categoryId: '' }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, name: ' a ' }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, variants: [] }).success).toBe(false)
  })

  it('từ chối SKU trống và SKU trùng (không phân biệt hoa/thường)', () => {
    expect(productFormSchema.safeParse(withVariant({ sku: '  ' })).success).toBe(false)
    const result = productFormSchema.safeParse({ ...valid, variants: [variant(), variant({ sku: 'candle-100' })] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['variants', 1, 'sku'])
  })

  it('từ chối loại sản phẩm và trạng thái ngoài enum của DB', () => {
    expect(productFormSchema.safeParse({ ...valid, productType: 'GIFT_BOX' }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, status: 'active' }).success).toBe(false)
  })

  it('form rỗng mặc định không hợp lệ', () => {
    expect(productFormSchema.safeParse(EMPTY_PRODUCT_FORM).success).toBe(false)
  })

  describe('ảnh', () => {
    const image = (override = {}) => ({ imageUrl: 'https://cdn.example.com/a.jpg', isThumbnail: false, productVariantId: '', ...override })
    it('URL phải là http(s); tối đa một ảnh đại diện', () => {
      expect(productFormSchema.safeParse({ ...valid, images: [image()] }).success).toBe(true)
      expect(messages({ ...valid, images: [image({ imageUrl: 'a.jpg' })] })[0]).toMatch(/http/)
      expect(messages({ ...valid, images: [image({ isThumbnail: true }), image({ isThumbnail: true })] })).toContain('images: Chỉ được chọn một ảnh đại diện')
    })
  })

  describe('tuỳ chọn và biến thể', () => {
    const color = { id: 'o1', name: 'Màu', values: [{ id: 'red', value: 'Đỏ', colorHex: '#AA0000' }, { id: 'blue', value: 'Xanh', colorHex: '' }] }
    it('mỗi biến thể phải chọn một giá trị của từng tuỳ chọn, tổ hợp không trùng', () => {
      const ok = { ...valid, options: [color], variants: [variant({ optionChoices: { o1: 'red' } }), variant({ sku: 'B', optionChoices: { o1: 'blue' } })] }
      expect(productFormSchema.safeParse(ok).success).toBe(true)
      expect(messages({ ...ok, variants: [variant()] })[0]).toMatch(/Chọn Màu/)
      expect(messages({ ...ok, variants: [variant({ optionChoices: { o1: 'red' } }), variant({ sku: 'B', optionChoices: { o1: 'red' } })] })[0]).toMatch(/Tổ hợp/)
    })
    it('kiểm tra tên/giá trị/mã màu của tuỳ chọn', () => {
      expect(messages({ ...valid, options: [{ ...color, name: ' ' }] }).join()).toMatch(/Nhập tên tuỳ chọn/)
      expect(messages({ ...valid, options: [{ ...color, values: [] }] }).join()).toMatch(/ít nhất một giá trị/)
      expect(messages({ ...valid, options: [{ ...color, values: [{ id: 'a', value: 'Đỏ', colorHex: 'red' }] }] }).join()).toMatch(/#RRGGBB/)
      expect(messages({ ...valid, options: [color, { ...color, id: 'o2', name: 'màu' }] }).join()).toMatch(/trùng/)
    })
  })

  it('kích thước: nhập đủ ba chiều hoặc để trống cả ba; ô số phải dương', () => {
    expect(productFormSchema.safeParse(withVariant({ length: '10', width: '5', height: '3', weightValue: '120' })).success).toBe(true)
    expect(messages(withVariant({ length: '10' }))[0]).toMatch(/Nhập đủ/)
    expect(messages(withVariant({ length: '10', width: '0', height: '3' })).join()).toMatch(/phải là số dương/)
  })

  describe('chính sách', () => {
    const perishable = (override: Partial<VariantFormInput> = {}) =>
      withVariant({ hasPolicy: true, isPerishable: true, returnPolicy: 'NO_RETURN', advancePaymentPercent: '50', ...override })
    it('hàng dễ hỏng phải không đổi trả và cọc từ 50%', () => {
      expect(productFormSchema.safeParse(perishable()).success).toBe(true)
      expect(messages(perishable({ returnPolicy: 'RETURNABLE' })).join()).toMatch(/không đổi trả/)
      expect(messages(perishable({ advancePaymentPercent: '49' })).join()).toMatch(/50%/)
      expect(messages(perishable({ advancePaymentPercent: '' })).join()).toMatch(/50%/)
    })
    it('cọc trong khoảng 0–100; hạn dùng là số giờ nguyên dương', () => {
      expect(messages(withVariant({ hasPolicy: true, advancePaymentPercent: '101' })).join()).toMatch(/0 đến 100/)
      expect(messages(withVariant({ hasPolicy: true, shelfLifeHours: '1.5' })).join()).toMatch(/nguyên/)
    })
    it('không kiểm tra chính sách khi tắt', () => {
      expect(productFormSchema.safeParse(withVariant({ hasPolicy: false, isPerishable: true, advancePaymentPercent: '' })).success).toBe(true)
    })
  })

  describe('set quà', () => {
    const group = (override = {}) => ({
      name: 'Thiệp', groupType: 'GREETING_CARD' as const, selectionType: 'SINGLE' as const, minSelections: '', maxSelections: '1', isRequired: false,
      options: [{ productVariantId: 'card', pricingMode: 'FREE' as const, fixedPrice: '' }], ...override,
    })
    const set = (v: Partial<VariantFormInput>) => withVariant(v, { productType: 'READY_MADE_GIFT_SET' })
    it('nhóm tuỳ chọn hợp lệ', () => expect(productFormSchema.safeParse(set({ optionGroups: [group()] })).success).toBe(true))
    it('kiểm tra min/max, nhóm bắt buộc, giá cố định', () => {
      expect(messages(set({ optionGroups: [group({ minSelections: '3', maxSelections: '2', selectionType: 'MULTIPLE' })] })).join()).toMatch(/Tối thiểu/)
      expect(messages(set({ optionGroups: [group({ maxSelections: '2' })] })).join()).toMatch(/chọn một/)
      expect(messages(set({ optionGroups: [group({ isRequired: true })] })).join()).toMatch(/bắt buộc/)
      const fixed = group({ options: [{ productVariantId: 'card', pricingMode: 'FIXED_PRICE', fixedPrice: '' }] })
      expect(messages(set({ optionGroups: [fixed] })).join()).toMatch(/giá cố định/)
    })
    it('thành phần: phải chọn sản phẩm, không trùng', () => {
      const component = { componentVariantId: 'x', componentRole: 'PRODUCT' as const, quantity: 1, isRequired: true }
      expect(messages(set({ components: [component, component] })).join()).toMatch(/trùng/)
      expect(messages(set({ components: [{ ...component, componentVariantId: '' }] })).join()).toMatch(/Chọn thành phần/)
    })
  })

  describe('toProductInput', () => {
    it('chuyển số, giữ mô tả và cờ hộp tùy chỉnh, bỏ nhãn hiển thị; ô trống thành null', () => {
      expect(toProductInput(productFormSchema.parse(valid))).toEqual({
        name: 'Nến thơm', description: 'Hương nhài', categoryId: 'c1', productType: 'REGULAR', status: 'AVAILABLE', isCustomBoxEligible: true,
        images: [], options: [],
        variants: [{
          sku: 'CANDLE-100', price: 185000, stockQuantity: 10, status: 'AVAILABLE', optionValueIds: [],
          dimensions: null, weight: null, policy: null, giftBoxDetail: null, bundle: null,
        }],
      })
    })
    it('mô tả trống được lưu là null; cờ hộp tùy chỉnh chỉ giữ với sản phẩm lẻ', () => {
      expect(toProductInput(productFormSchema.parse({ ...valid, description: '   ' })).description).toBeNull()
      expect(toProductInput(productFormSchema.parse({ ...valid, productType: 'GREETING_CARD' })).isCustomBoxEligible).toBe(false)
    })
    it('lòng hộp chỉ gửi với hộp quà; bundle chỉ gửi với set', () => {
      const detail = { innerLength: '22', innerWidth: '22', innerHeight: '10', maxWeightValue: '3' }
      const box = toProductInput(productFormSchema.parse(withVariant(detail, { productType: 'READY_MADE_GIFT_BOX' })))
      expect(box.variants[0]?.giftBoxDetail).toEqual({ inner: { length: 22, width: 22, height: 10, unit: 'CM' }, maxWeight: { value: 3, unit: 'KG' } })
      expect(box.variants[0]?.bundle).toBeNull()
      const regular = toProductInput(productFormSchema.parse(withVariant(detail)))
      expect(regular.variants[0]?.giftBoxDetail).toBeNull()
    })
    it('ảnh chung được gửi là null, ảnh riêng giữ id biến thể', () => {
      const images = [
        { imageUrl: 'https://a/1.jpg', isThumbnail: true, productVariantId: '' },
        { imageUrl: 'https://a/2.jpg', isThumbnail: false, productVariantId: 'v1' },
      ]
      expect(toProductInput(productFormSchema.parse({ ...valid, images })).images.map((i) => i.productVariantId)).toEqual([null, 'v1'])
    })
  })

  describe('khứ hồi sản phẩm mẫu (toFormValues → schema → toProductInput)', () => {
    const products = resolveProducts(createDb())
    it.each(products.map((p) => [p.name, p] as const))('%s', (_name, product) => {
      const parsed = productFormSchema.safeParse(toFormValues(product))
      expect(messages(toFormValues(product))).toEqual([])
      expect(parsed.success).toBe(true)
      if (!parsed.success) return
      const input = toProductInput(parsed.data)
      expect(input.variants.map((v) => v.id)).toEqual(product.variants.map((v) => v.id))
      expect(input.variants.map((v) => v.optionValueIds.sort())).toEqual(product.variants.map((v) => [...v.optionValueIds].sort()))
      expect(input.variants.map((v) => v.policy)).toEqual(product.variants.map((v) => v.policy))
      expect(input.variants.map((v) => v.giftBoxDetail)).toEqual(product.variants.map((v) => v.giftBoxDetail))
      expect(input.variants.map((v) => v.bundle?.components.length ?? 0)).toEqual(product.variants.map((v) => v.bundle?.components.length ?? 0))
    })
    it('có đủ dữ liệu mẫu để phủ set, hộp và tuỳ chọn', () => {
      expect(seedProducts.some((p) => p.productType === 'READY_MADE_GIFT_SET')).toBe(true)
    })
  })
})
