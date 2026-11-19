import { ensureObject } from './ensureObject'
import { ApiError } from './errors'

describe('ensureObject', () => {
  it('trả lại object có đủ khoá', () => {
    const value = { id: '1', items: [] }
    expect(ensureObject<typeof value>(value, ['id', 'items'])).toBe(value)
  })

  it('chấp nhận khoá có giá trị null/rỗng (chỉ kiểm tra sự tồn tại)', () => {
    expect(() => ensureObject({ token: null }, ['token'])).not.toThrow()
  })

  it.each([
    ['thiếu khoá', { id: '1' }],
    ['chuỗi HTML', '<html></html>'],
    ['mảng', []],
    ['null', null],
    ['undefined', undefined],
    ['số', 42],
  ])('ném ApiError khi nhận %s', (_label, value) => {
    expect(() => ensureObject(value, ['id', 'items'])).toThrow(ApiError)
  })
})
