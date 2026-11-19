import { cn } from './cn'

describe('cn', () => {
  it('gộp nhiều class và bỏ giá trị falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('hỗ trợ object và mảng điều kiện', () => {
    expect(cn({ active: true, hidden: false }, ['x', 'y'])).toBe('active x y')
  })

  it('class Tailwind xung đột: class đứng sau thắng', () => {
    expect(cn('px-2 text-sm', 'px-6')).toBe('text-sm px-6')
  })
})
