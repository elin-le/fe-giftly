import { readRedirectState } from './redirectState'

describe('readRedirectState', () => {
  it('đọc from và reason hợp lệ', () => {
    expect(readRedirectState({ from: '/cart?x=1', reason: 'Vui lòng đăng nhập' })).toEqual({
      from: '/cart?x=1',
      reason: 'Vui lòng đăng nhập',
    })
  })

  it.each([[null], [undefined], ['chuỗi'], [42], [[]]])('trả về rỗng khi state là %s', (state) => {
    expect(readRedirectState(state)).toEqual({ from: undefined, reason: undefined })
  })

  it.each([['https://evil.example'], ['//evil.example'], ['javascript:alert(1)'], [''], [123]])(
    'bỏ qua from không phải đường dẫn nội bộ: %s',
    (from) => {
      expect(readRedirectState({ from }).from).toBeUndefined()
    },
  )

  it('bỏ qua reason rỗng hoặc không phải chuỗi', () => {
    expect(readRedirectState({ reason: '   ' }).reason).toBeUndefined()
    expect(readRedirectState({ reason: 5 }).reason).toBeUndefined()
  })
})
