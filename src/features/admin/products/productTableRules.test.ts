import { makeProduct, makeVariant } from '@/features/products/testUtils'
import { EMPTY_FILTER, countLowStockVariants, filterProducts, getStockLevel } from './productTableRules'

describe('getStockLevel', () => {
  it.each([[0, 'out'], [-1, 'out'], [1, 'low'], [5, 'low'], [6, 'ok']] as const)('%i → %s', (qty, level) => expect(getStockLevel(qty)).toBe(level))
})

describe('filterProducts', () => {
  const candle = makeProduct({ name: 'Nến thơm Hoa Nhài', categoryId: 'c1', variants: [makeVariant({ id: 'v1', sku: 'CANDLE-100' })] })
  const tea = makeProduct({ name: 'Trà thảo mộc', categoryId: 'c2', status: 'OUT_OF_STOCK', variants: [makeVariant({ id: 'v2', sku: 'TEA-1' })] })
  const all = [candle, tea]

  it('không lọc thì giữ nguyên', () => expect(filterProducts(all, EMPTY_FILTER)).toEqual(all))
  it('tìm không phân biệt dấu và hoa thường, cả theo SKU', () => {
    expect(filterProducts(all, { ...EMPTY_FILTER, search: 'nen THOM' })).toEqual([candle])
    expect(filterProducts(all, { ...EMPTY_FILTER, search: 'tea-1' })).toEqual([tea])
    expect(filterProducts(all, { ...EMPTY_FILTER, search: '   ' })).toEqual(all)
  })
  it('kết hợp bộ lọc danh mục và trạng thái', () => {
    expect(filterProducts(all, { ...EMPTY_FILTER, categoryId: 'c2', status: 'OUT_OF_STOCK' })).toEqual([tea])
    expect(filterProducts(all, { ...EMPTY_FILTER, categoryId: 'c1', status: 'OUT_OF_STOCK' })).toEqual([])
  })
})

describe('countLowStockVariants', () => {
  it('đếm biến thể hết hoặc sắp hết hàng', () => expect(countLowStockVariants([{ stockQuantity: 0 }, { stockQuantity: 3 }, { stockQuantity: 50 }])).toBe(2))
})
