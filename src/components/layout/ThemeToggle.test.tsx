import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useThemeStore } from '@/stores/themeStore'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => useThemeStore.getState().setMode('light'))

  it('chuyển sang chế độ ban đêm và cập nhật nhãn truy cập', async () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: 'Chuyển sang chế độ ban đêm' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Chuyển sang chế độ ban ngày' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('chuyển ngược lại về chế độ ban ngày', async () => {
    useThemeStore.getState().setMode('dark')
    render(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'Chuyển sang chế độ ban ngày' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
