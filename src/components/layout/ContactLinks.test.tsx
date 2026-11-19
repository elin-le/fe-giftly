import { render, screen } from '@testing-library/react'
import { ContactLinks } from './ContactLinks'

describe('ContactLinks', () => {
  it('có liên kết Zalo và Facebook mở tab mới', () => {
    render(<ContactLinks />)
    const zalo = screen.getByRole('link', { name: /Zalo 0839003848/ })
    expect(zalo).toHaveAttribute('href', 'https://zalo.me/0839003848')
    expect(zalo).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: /Facebook/ })).toHaveAttribute('href', expect.stringContaining('facebook.com'))
  })
})
