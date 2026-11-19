import { getThumbnailUrl, isPurchasable, isVisibleInStore } from './productRules'
import { makeProduct } from './testUtils'

const image = (id: string, overrides = {}) => ({
  id,
  imageUrl: `http://cdn/${id}.jpg`,
  secureUrl: `https://cdn/${id}.jpg`,
  publicId: id,
  isThumbnail: false,
  productVariantId: null,
  ...overrides,
})

describe('isPurchasable', () => {
  it('chỉ mua được khi đang bán và còn hàng', () => {
    expect(isPurchasable(makeProduct())).toBe(true)
    expect(isPurchasable(makeProduct({ stockQuantity: 0 }))).toBe(false)
    expect(isPurchasable(makeProduct({ status: 'OUT_OF_STOCK' }))).toBe(false)
    expect(isPurchasable(makeProduct({ status: 'DISCONTINUED' }))).toBe(false)
  })
})

describe('isVisibleInStore', () => {
  it('ẩn sản phẩm ngừng bán, vẫn hiện sản phẩm hết hàng', () => {
    expect(isVisibleInStore(makeProduct({ status: 'DISCONTINUED' }))).toBe(false)
    expect(isVisibleInStore(makeProduct({ status: 'OUT_OF_STOCK' }))).toBe(true)
    expect(isVisibleInStore(makeProduct())).toBe(true)
  })
})

describe('getThumbnailUrl', () => {
  it('ưu tiên ảnh thumbnail và dùng URL https', () => {
    const images = [image('a'), image('b', { isThumbnail: true })]
    expect(getThumbnailUrl({ images })).toBe('https://cdn/b.jpg')
  })

  it('không có thumbnail thì lấy ảnh đầu tiên', () => {
    expect(getThumbnailUrl({ images: [image('a'), image('b')] })).toBe('https://cdn/a.jpg')
  })

  it('lùi về imageUrl khi secureUrl rỗng; không có ảnh thì undefined', () => {
    expect(getThumbnailUrl({ images: [image('a', { secureUrl: '' })] })).toBe('http://cdn/a.jpg')
    expect(getThumbnailUrl({ images: [] })).toBeUndefined()
  })
})
