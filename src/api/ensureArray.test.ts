import { ApiError } from './errors'
import { ensureArray } from './ensureArray'

describe('ensureArray', () => {
  it('trả lại mảng hợp lệ, kể cả mảng rỗng', () => {
    expect(ensureArray<number>([1, 2])).toEqual([1, 2])
    expect(ensureArray([])).toEqual([])
  })

  it.each([['chuỗi HTML', '<html></html>'], ['object', {}], ['null', null], ['undefined', undefined]])(
    'ném ApiError khi nhận %s',
    (_label, value) => {
      expect(() => ensureArray(value)).toThrow(ApiError)
    },
  )
})
