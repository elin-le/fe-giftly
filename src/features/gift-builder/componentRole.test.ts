import { getItemRole, isComplimentaryInBox } from './componentRole'

describe('getItemRole', () => {
  it.each([
    ['PACKAGING_ACCESSORY', 'ACCESSORY'],
    ['GREETING_CARD', 'GREETING_CARD'],
    ['REGULAR', 'PRODUCT'],
    ['READY_MADE_GIFT_BOX', 'PRODUCT'],
  ] as const)('%s → %s', (productType, role) => {
    expect(getItemRole(productType)).toBe(role)
  })
})

describe('isComplimentaryInBox', () => {
  it('chỉ phụ kiện đóng gói được miễn phí', () => {
    expect(isComplimentaryInBox('PACKAGING_ACCESSORY')).toBe(true)
    expect(isComplimentaryInBox('GREETING_CARD')).toBe(false)
    expect(isComplimentaryInBox('REGULAR')).toBe(false)
  })
})
