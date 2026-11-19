import { BUILDER_STEPS, getMaxReachableIndex } from './builderSteps'
import { addItem, chooseBox, EMPTY_DRAFT, toggleItem } from './giftBox'
import { entryOf, makeAccessory, makeBox, makeGift } from './testUtils'

describe('getMaxReachableIndex', () => {
  it('chỉ bước đầu khi chưa chọn hộp', () => {
    expect(getMaxReachableIndex(EMPTY_DRAFT)).toBe(0)
  })

  it('tới bước chọn món khi đã có hộp', () => {
    expect(getMaxReachableIndex(chooseBox(EMPTY_DRAFT, entryOf(makeBox())))).toBe(1)
  })

  it('phụ kiện chưa đủ để mở bước tiếp theo', () => {
    const draft = toggleItem(chooseBox(EMPTY_DRAFT, entryOf(makeBox())), entryOf(makeAccessory()))
    expect(getMaxReachableIndex(draft)).toBe(1)
  })

  it('mở hết các bước khi đã có món quà', () => {
    const draft = addItem(chooseBox(EMPTY_DRAFT, entryOf(makeBox())), entryOf(makeGift()))
    expect(getMaxReachableIndex(draft)).toBe(BUILDER_STEPS.length - 1)
  })
})
