import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useToastStore } from '@/stores/toastStore'
import { Toaster } from './toaster'

describe('Toaster', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('hiển thị thông báo và cho đóng thủ công', async () => {
    render(<Toaster />)
    act(() => useToastStore.getState().show('Đã thêm vào giỏ hàng', 'success'))
    expect(await screen.findByText('Đã thêm vào giỏ hàng')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('không hiển thị gì khi không có thông báo', () => {
    render(<Toaster />)
    expect(screen.queryByRole('button', { name: 'Đóng thông báo' })).not.toBeInTheDocument()
  })
})
