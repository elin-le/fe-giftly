const TARGET_SELECTOR = '[data-cart-target]'
const FLIGHT_MS = 700
const SIZE = 56

/** Chấm tròn bay từ `source` tới biểu tượng giỏ hàng rồi làm giỏ "nảy" — giải thích trực quan rằng món đã vào giỏ. Không làm gì nếu thiếu phần tử hoặc người dùng giảm chuyển động. */
export function flyToCart(source: Element | null, imageUrl?: string | null): void {
  const target = document.querySelector(TARGET_SELECTOR)
  if (!source || !target || typeof source.animate !== 'function') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const dot = document.createElement('div')
  dot.setAttribute('aria-hidden', 'true')
  Object.assign(dot.style, {
    position: 'fixed',
    zIndex: '90',
    left: `${from.left + from.width / 2 - SIZE / 2}px`,
    top: `${from.top + from.height / 2 - SIZE / 2}px`,
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: '9999px',
    pointerEvents: 'none',
    background: imageUrl ? `center / cover url("${imageUrl}")` : 'var(--accent)',
    boxShadow: 'var(--shadow-pop)',
    border: '2px solid var(--accent)',
  })
  document.body.appendChild(dot)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const flight = dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px,${dy * 0.55 - 70}px) scale(0.8)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) scale(0.2)`, opacity: 0.6 },
    ],
    { duration: FLIGHT_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
  flight.onfinish = () => {
    dot.remove()
    target.animate?.(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.3) rotate(-8deg)' }, { transform: 'scale(1)' }],
      { duration: 380, easing: 'ease-out' },
    )
  }
}
