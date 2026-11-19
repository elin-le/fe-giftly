import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { RoleName } from '../types'
import { RequireAuth } from './RequireAuth'

function SignInProbe() {
  const { state } = useLocation()
  return <pre data-testid="state">{JSON.stringify(state)}</pre>
}

const renderAt = (path: string, role?: RoleName) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/signin" element={<SignInProbe />} />
        <Route element={<RequireAuth role={role} reason="Cần đăng nhập" />}>
          <Route path="/cart" element={<p>Nội dung giỏ hàng</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

const signInAs = (roles: RoleName[]) =>
  useAuthStore.getState().setSession({
    token: 't',
    user: { id: 'u1', email: 'a@b.co', fullName: 'An', phone: null, status: 'ACTIVE', roles },
  })

describe('RequireAuth', () => {
  beforeEach(() => useAuthStore.getState().signOut())

  it('chưa đăng nhập: chuyển tới /signin kèm trang quay lại và lý do', () => {
    renderAt('/cart?tab=1')
    expect(screen.queryByText('Nội dung giỏ hàng')).not.toBeInTheDocument()
    expect(JSON.parse(screen.getByTestId('state').textContent ?? '{}')).toEqual({
      from: '/cart?tab=1',
      reason: 'Cần đăng nhập',
    })
  })

  it('đã đăng nhập: hiển thị nội dung', () => {
    signInAs(['ROLE_USER'])
    renderAt('/cart')
    expect(screen.getByText('Nội dung giỏ hàng')).toBeInTheDocument()
  })

  it('đã đăng nhập nhưng thiếu quyền quản trị: hiện trang 403', () => {
    signInAs(['ROLE_USER'])
    renderAt('/cart', 'ROLE_ADMIN')
    expect(screen.getByRole('heading', { name: 'Bạn không có quyền truy cập' })).toBeInTheDocument()
    expect(screen.queryByText('Nội dung giỏ hàng')).not.toBeInTheDocument()
  })

  it('quản trị viên vào được khu vực yêu cầu ROLE_ADMIN', () => {
    signInAs(['ROLE_USER', 'ROLE_ADMIN'])
    renderAt('/cart', 'ROLE_ADMIN')
    expect(screen.getByText('Nội dung giỏ hàng')).toBeInTheDocument()
  })
})
