import { makeProduct, makeVariant } from './testUtils'
import { validateProductInput } from './productInputRules'
import type { ProductInput, VariantInput } from './types'

const variant = (override: Partial<VariantInput> = {}): VariantInput => ({
  sku: 'NEW-1', price: 100000, stockQuantity: 5, status: 'AVAILABLE', optionValueIds: [],
  dimensions: null, weight: null, policy: null, giftBoxDetail: null, bundle: null, ...override,
})
const input = (override: Partial<ProductInput> = {}): ProductInput => ({
  categoryId: 'c1', name: 'Nến', description: null, productType: 'REGULAR', status: 'AVAILABLE', isCustomBoxEligible: false,
  images: [], options: [], variants: [variant()], ...override,
})

const card = makeProduct({ id: 'card', productType: 'GREETING_CARD', variants: [makeVariant({ id: 'card-v', productId: 'card', sku: 'CARD' })] })
const wrap = makeProduct({ id: 'wrap', productType: 'PACKAGING_ACCESSORY', variants: [makeVariant({ id: 'wrap-v', productId: 'wrap', sku: 'WRAP' })] })
const box = makeProduct({ id: 'box', productType: 'READY_MADE_GIFT_BOX', variants: [makeVariant({ id: 'box-v', productId: 'box', sku: 'BOX' })] })
const regular = makeProduct({ id: 'reg', productType: 'REGULAR', variants: [makeVariant({ id: 'reg-v', productId: 'reg', sku: 'REG' })] })
const aSet = makeProduct({ id: 'set', productType: 'READY_MADE_GIFT_SET', variants: [makeVariant({ id: 'set-v', productId: 'set', sku: 'SET' })] })
const ctx = { categoryIds: ['c1'], otherProducts: [card, wrap, box, regular, aSet] }
const check = (override: Partial<ProductInput>) => validateProductInput(input(override), ctx)
const setInput = (bundle: NonNullable<VariantInput['bundle']>) => check({ productType: 'READY_MADE_GIFT_SET', variants: [variant({ bundle })] })
const comp = (id: string, role: 'BOX' | 'PRODUCT' | 'ACCESSORY' | 'GREETING_CARD') => ({ componentVariantId: id, componentRole: role, quantity: 1, isRequired: true })
const group = (override = {}) => ({
  name: 'Thiệp', groupType: 'GREETING_CARD' as const, selectionType: 'SINGLE' as const, minSelections: 0, maxSelections: 1, isRequired: false,
  options: [{ productVariantId: 'card-v', pricingMode: 'FREE' as const, fixedPrice: null }], ...override,
})

describe('validateProductInput', () => {
  it('chấp nhận sản phẩm hợp lệ', () => expect(check({})).toBeNull())

  it('từ chối thông tin cơ bản sai', () => {
    expect(check({ name: ' ' })).toMatch(/Tên/)
    expect(check({ categoryId: 'x' })).toMatch(/Danh mục/)
    expect(check({ variants: [] })).toMatch(/ít nhất một biến thể/)
  })

  it('SKU trùng sản phẩm khác (không phân biệt hoa thường) hoặc trùng trong sản phẩm', () => {
    expect(check({ variants: [variant({ sku: 'card' })] })).toMatch(/đã tồn tại/)
    expect(check({ variants: [variant({ sku: 'A' }), variant({ sku: 'a' })] })).toMatch(/đã tồn tại/)
  })

  it('ảnh: URL hợp lệ, tối đa một ảnh đại diện', () => {
    expect(check({ images: [{ imageUrl: 'ftp://x', isThumbnail: false, productVariantId: null }] })).toMatch(/http/)
    const two = [{ imageUrl: 'https://a/1.jpg', isThumbnail: true, productVariantId: null }, { imageUrl: 'https://a/2.jpg', isThumbnail: true, productVariantId: null }]
    expect(check({ images: two })).toMatch(/ảnh đại diện/)
    expect(check({ images: [two[0]!] })).toBeNull()
    expect(check({ images: [{ imageUrl: 'https://a/1.jpg', isThumbnail: false, productVariantId: 'khong-co' }] })).toMatch(/biến thể đã có/)
    expect(check({ images: [{ imageUrl: 'https://a/1.jpg', isThumbnail: false, productVariantId: 'mine' }], variants: [variant({ id: 'mine' })] })).toBeNull()
  })

  describe('tuỳ chọn và biến thể', () => {
    const color = { id: 'o1', name: 'Màu', values: [{ id: 'v-red', value: 'Đỏ', colorHex: '#AA0000' }, { id: 'v-blue', value: 'Xanh', colorHex: null }] }
    it('mỗi biến thể chọn đúng một giá trị cho mỗi tuỳ chọn, tổ hợp không trùng', () => {
      expect(check({ options: [color], variants: [variant({ optionValueIds: ['v-red'] }), variant({ sku: 'B', optionValueIds: ['v-blue'] })] })).toBeNull()
      expect(check({ options: [color], variants: [variant({ optionValueIds: [] })] })).toMatch(/đúng một giá trị/)
      expect(check({ options: [color], variants: [variant({ optionValueIds: ['v-red', 'v-blue'] })] })).toMatch(/đúng một giá trị/)
      expect(check({ options: [color], variants: [variant({ optionValueIds: ['v-red'] }), variant({ sku: 'B', optionValueIds: ['v-red'] })] })).toMatch(/cùng tổ hợp/)
      expect(check({ variants: [variant({ optionValueIds: ['v-red'] })] })).toMatch(/không có tuỳ chọn/)
    })
    it('kiểm tra tên, giá trị, mã màu của tuỳ chọn', () => {
      expect(check({ options: [{ ...color, name: ' ' }], variants: [variant({ optionValueIds: ['v-red'] })] })).toMatch(/Tên tuỳ chọn/)
      expect(check({ options: [{ ...color, values: [] }] })).toMatch(/ít nhất một giá trị/)
      expect(check({ options: [{ ...color, values: [{ id: 'a', value: 'Đỏ', colorHex: 'red' }] }], variants: [variant({ optionValueIds: ['a'] })] })).toMatch(/#RRGGBB/)
      expect(check({ options: [{ ...color, values: [{ id: 'a', value: 'Đỏ', colorHex: null }, { id: 'b', value: 'đỏ', colorHex: null }] }], variants: [variant({ optionValueIds: ['a'] })] })).toMatch(/trùng/)
    })
  })

  it('kích thước/khối lượng: đủ trường, dương, có đơn vị', () => {
    const ok = { length: 1, width: 2, height: 3, unit: 'CM' as const }
    expect(check({ variants: [variant({ dimensions: ok, weight: { value: 1, unit: 'KG' } })] })).toBeNull()
    expect(check({ variants: [variant({ dimensions: { ...ok, height: 0 } })] })).toMatch(/Kích thước/)
    expect(check({ variants: [variant({ weight: { value: -1, unit: 'G' } })] })).toMatch(/Khối lượng/)
  })

  describe('chính sách biến thể', () => {
    const policy = (o = {}) => ({ isPerishable: false, shelfLifeHours: null, returnPolicy: 'RETURNABLE' as const, advancePaymentPercent: null, ...o })
    it('đặt cọc 0–100', () => {
      expect(check({ variants: [variant({ policy: policy({ advancePaymentPercent: 101 }) })] })).toMatch(/0 đến 100/)
      expect(check({ variants: [variant({ policy: policy({ advancePaymentPercent: 100 }) })] })).toBeNull()
    })
    it('hàng dễ hỏng phải NO_RETURN và cọc ≥ 50%', () => {
      const bad = [{ returnPolicy: 'RETURNABLE', advancePaymentPercent: 50 }, { returnPolicy: 'NO_RETURN', advancePaymentPercent: 49 }, { returnPolicy: 'NO_RETURN', advancePaymentPercent: null }]
      for (const override of bad) expect(check({ variants: [variant({ policy: policy({ isPerishable: true, ...override }) })] })).toMatch(/dễ hỏng/)
      expect(check({ variants: [variant({ policy: policy({ isPerishable: true, shelfLifeHours: 48, returnPolicy: 'NO_RETURN', advancePaymentPercent: 50 }) })] })).toBeNull()
    })
  })

  it('lòng hộp chỉ dành cho hộp quà', () => {
    const detail = { inner: { length: 10, width: 10, height: 5, unit: 'CM' as const }, maxWeight: { value: 2, unit: 'KG' as const } }
    expect(check({ productType: 'READY_MADE_GIFT_BOX', variants: [variant({ giftBoxDetail: detail })] })).toBeNull()
    expect(check({ productType: 'REGULAR', variants: [variant({ giftBoxDetail: detail })] })).toMatch(/hộp quà/)
    expect(check({ productType: 'READY_MADE_GIFT_BOX', variants: [variant({ giftBoxDetail: { ...detail, maxWeight: { value: 0, unit: 'KG' } } })] })).toMatch(/Tải trọng/)
  })

  describe('set quà', () => {
    it('bundle chỉ dành cho set; thành phần đúng vai trò', () => {
      expect(check({ variants: [variant({ bundle: { components: [], optionGroups: [] } })] })).toMatch(/set quà/)
      expect(setInput({ components: [comp('box-v', 'BOX'), comp('reg-v', 'PRODUCT'), comp('wrap-v', 'ACCESSORY')], optionGroups: [group()] })).toBeNull()
      expect(setInput({ components: [comp('reg-v', 'BOX')], optionGroups: [] })).toMatch(/không khớp vai trò/)
      expect(setInput({ components: [comp('set-v', 'PRODUCT')], optionGroups: [] })).toMatch(/không khớp vai trò/)
      expect(setInput({ components: [comp('nope', 'PRODUCT')], optionGroups: [] })).toMatch(/không tồn tại/)
      expect(setInput({ components: [comp('reg-v', 'PRODUCT'), comp('reg-v', 'PRODUCT')], optionGroups: [] })).toMatch(/trùng/)
    })
    it('nhóm tuỳ chọn: loại, min/max, giá', () => {
      const run = (g: object) => setInput({ components: [], optionGroups: [group(g)] })
      expect(run({ options: [{ productVariantId: 'wrap-v', pricingMode: 'FREE', fixedPrice: null }] })).toMatch(/không khớp loại nhóm/)
      expect(run({ minSelections: 2, maxSelections: 1 })).toMatch(/tối thiểu/)
      expect(run({ maxSelections: 2 })).toMatch(/chọn một/)
      expect(run({ isRequired: true, minSelections: 0 })).toMatch(/bắt buộc/)
      expect(run({ options: [] })).toMatch(/ít nhất một lựa chọn/)
      expect(run({ options: [{ productVariantId: 'card-v', pricingMode: 'FIXED_PRICE', fixedPrice: null }] })).toMatch(/giá cố định/i)
      expect(run({ options: [{ productVariantId: 'card-v', pricingMode: 'FREE', fixedPrice: 5000 }] })).toMatch(/giá cố định/i)
      expect(run({ options: [{ productVariantId: 'card-v', pricingMode: 'FIXED_PRICE', fixedPrice: 20000 }] })).toBeNull()
    })
  })
})
