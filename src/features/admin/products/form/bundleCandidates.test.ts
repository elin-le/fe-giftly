import { makeProduct, makeVariant } from '@/features/products/testUtils'
import { buildVariantCandidates, filterCandidates } from './bundleCandidates'

const products = [
  makeProduct({ id: 'a', name: 'Nến', productType: 'REGULAR', variants: [makeVariant({ id: 'a1', productId: 'a', sku: 'N-1' }), makeVariant({ id: 'a2', productId: 'a', sku: 'N-2', status: 'DISCONTINUED' })] }),
  makeProduct({ id: 'b', name: 'Thiệp', productType: 'GREETING_CARD', variants: [makeVariant({ id: 'b1', productId: 'b', sku: 'T-1' })] }),
  makeProduct({ id: 's', name: 'Set', productType: 'READY_MADE_GIFT_SET', variants: [makeVariant({ id: 's1', productId: 's', sku: 'S-1' })] }),
]

describe('buildVariantCandidates', () => {
  it('bỏ set quà, biến thể ngừng bán và sản phẩm đang sửa', () => {
    expect(buildVariantCandidates(products).map((c) => c.variantId)).toEqual(['a1', 'b1'])
    expect(buildVariantCandidates(products, 'a').map((c) => c.variantId)).toEqual(['b1'])
  })
  it('nhãn có tên sản phẩm và SKU; lọc theo loại', () => {
    const all = buildVariantCandidates(products)
    expect(all[0]?.label).toBe('Nến · N-1')
    expect(filterCandidates(all, ['GREETING_CARD']).map((c) => c.variantId)).toEqual(['b1'])
  })
})
