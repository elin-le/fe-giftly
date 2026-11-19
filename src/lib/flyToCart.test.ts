import { flyToCart } from './flyToCart'

describe('flyToCart', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('không lỗi khi thiếu phần tử đích hoặc nguồn', () => {
    expect(() => flyToCart(null)).not.toThrow()
    expect(() => flyToCart(document.createElement('div'))).not.toThrow()
  })

  it('tạo chấm bay rồi dọn đi khi hoạt ảnh kết thúc', () => {
    const target = document.createElement('a')
    target.setAttribute('data-cart-target', '')
    target.animate = vi.fn() as never
    const source = document.createElement('button')
    document.body.append(target, source)
    let finish: (() => void) | undefined
    source.animate = vi.fn() as never
    const animate = vi.fn(() => ({ set onfinish(fn: () => void) { finish = fn } }))
    HTMLDivElement.prototype.animate = animate as never
    window.matchMedia = vi.fn(() => ({ matches: false })) as never

    flyToCart(source)
    expect(document.body.querySelectorAll('div[aria-hidden]')).toHaveLength(1)
    finish?.()
    expect(document.body.querySelectorAll('div[aria-hidden]')).toHaveLength(0)
    expect(target.animate).toHaveBeenCalled()
  })
})
