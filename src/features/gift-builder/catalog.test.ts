import { makeVariant } from '@/features/products/testUtils'
import { splitCatalog } from './catalog'
import { makeAccessory, makeBox, makeCard, makeGift } from './testUtils'
import { makeProduct } from '@/features/products/testUtils'

describe('splitCatalog', () => {
  it('tách biến thể theo product_type và sắp hộp theo giá', () => {
    const big = makeBox({ id: 'b2', variants: [makeVariant({ id: 'bv2', productId: 'b2', price: 130000 })] })
    const catalog = splitCatalog([big, makeBox(), makeAccessory(), makeCard(), makeGift()])
    expect(catalog.boxes.map((e) => e.variant.id)).toEqual(['bv1', 'bv2'])
    expect(catalog.accessories).toHaveLength(1)
    expect(catalog.cards).toHaveLength(1)
    expect(catalog.items.map((e) => e.variant.id)).toEqual(['gv1'])
  })

  it('mỗi biến thể còn bán là một mục; biến thể hết hàng bị bỏ', () => {
    const gift = makeGift({
      variants: [makeVariant({ id: 'a', stockQuantity: 3 }), makeVariant({ id: 'b', stockQuantity: 0 }), makeVariant({ id: 'c', stockQuantity: 1, status: 'DISCONTINUED' })],
    })
    expect(splitCatalog([gift]).items.map((e) => e.variant.id)).toEqual(['a'])
  })

  it('REGULAR không được phép vào hộp thì bị bỏ; set quà không bao giờ vào hộp', () => {
    const catalog = splitCatalog([makeGift({ isCustomBoxEligible: false }), makeProduct({ id: 's', productType: 'READY_MADE_GIFT_SET' })])
    expect(catalog).toEqual({ boxes: [], items: [], accessories: [], cards: [] })
  })

  it('bỏ sản phẩm hết hàng hoặc ngừng bán', () => {
    const catalog = splitCatalog([makeBox({ status: 'OUT_OF_STOCK' }), makeGift({ status: 'DISCONTINUED' })])
    expect(catalog).toEqual({ boxes: [], items: [], accessories: [], cards: [] })
  })

  it('danh sách rỗng', () => {
    expect(splitCatalog([])).toEqual({ boxes: [], items: [], accessories: [], cards: [] })
  })
})
