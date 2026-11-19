import { getCartItemName } from './cartItemName'
import { makeGiftBoxItem, makeVariantItem } from './testUtils'

describe('getCartItemName', () => {
  it('sản phẩm không có tuỳ chọn: tên sản phẩm', () => {
    expect(getCartItemName(makeVariantItem())).toBe('Nến thơm Hoa Nhài')
  })

  it('biến thể: kèm nhãn tuỳ chọn', () => {
    const item = makeVariantItem()
    item.variant.optionLabel = '200g'
    expect(getCartItemName(item)).toBe('Nến thơm Hoa Nhài (200g)')
  })

  it('hộp quà tùy chỉnh: kèm tên hộp', () => {
    expect(getCartItemName(makeGiftBoxItem())).toBe('Hộp quà tùy chỉnh · Hộp Giftly')
  })
})
