import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import type { RoleName } from '../types'
import { UserMenu } from './UserMenu'

const signInAs = (roles: RoleName[], fullName = 'Minh Anh') =>
  useAuthStore.getState().setSession({
    token: 't',
    user: { id: 'u1', email: 'minhanh@example.com', fullName, phone: null, status: 'ACTIVE', roles },
  })

const renderMenu = () =>
  render(
    <MemoryRouter initialEntries={['/cart']}>
      <UserMenu />
      <Routes>
        <Route path="/" element={<p>Trang chủ</p>} />
        <Route path="/cart" element={<p>Trang giỏ hàng</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('UserMenu', () => {
  beforeEach(() => {
    useAuthStore.getState().signOut()
    useToastStore.setState({ toasts: [] })
  })

  it('chưa đăng nhập: có liên kết đăng nhập và đăng ký, không có menu tài khoản', () => {
    renderMenu()
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/signin')
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('button', { name: 'Tài khoản của tôi' })).not.toBeInTheDocument()
  })

  it('đã đăng nhập: hiện chữ cái đầu và mở menu với tên, email', async () => {
    signInAs(['ROLE_USER'])
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Tài khoản của tôi' })
    expect(trigger).toHaveTextContent('M')

    await userEvent.click(trigger)
    expect(await screen.findByText('Minh Anh')).toBeInTheDocument()
    expect(screen.getByText('minhanh@example.com')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Đơn hàng của tôi/ })).toBeInTheDocument()
  })

  it('chỉ quản trị viên mới thấy mục Trang quản trị', async () => {
    signInAs(['ROLE_USER'])
    const first = renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Tài khoản của tôi' }))
    await screen.findByRole('menuitem', { name: /Đơn hàng của tôi/ })
    expect(screen.queryByRole('menuitem', { name: /Trang quản trị/ })).not.toBeInTheDocument()
    first.unmount()

    signInAs(['ROLE_USER', 'ROLE_ADMIN'])
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Tài khoản của tôi' }))
    expect(await screen.findByRole('menuitem', { name: /Trang quản trị/ })).toBeInTheDocument()
  })

  it('đăng xuất: xoá phiên, báo cho người dùng và về trang chủ', async () => {
    signInAs(['ROLE_USER'])
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Tài khoản của tôi' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Đăng xuất/ }))

    expect(useAuthStore.getState().token).toBeNull()
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    expect(useToastStore.getState().toasts[0]?.message).toBe('Đã đăng xuất')
  })

  it('tên rỗng không làm hỏng nút tài khoản', () => {
    signInAs(['ROLE_USER'], '   ')
    renderMenu()
    expect(screen.getByRole('button', { name: 'Tài khoản của tôi' })).toHaveTextContent('?')
  })
})
