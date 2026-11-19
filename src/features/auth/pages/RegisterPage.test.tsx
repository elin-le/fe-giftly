import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '../api/authApi'
import type { AuthSession } from '../types'
import { RegisterPage } from './RegisterPage'

vi.mock('../api/authApi', () => ({ authApi: { signIn: vi.fn(), register: vi.fn() } }))

const register = vi.mocked(authApi.register)

const session: AuthSession = {
  token: 'tok',
  user: { id: 'u9', email: 'an@example.com', fullName: 'Nguyễn An', phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] },
}

const renderPage = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/register', state }]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/builder" element={<p>Trang thiết kế</p>} />
        <Route path="/" element={<p>Trang chủ</p>} />
      </Routes>
    </MemoryRouter>,
  )

async function fillForm(user: ReturnType<typeof userEvent.setup>, overrides: Record<string, string> = {}) {
  const values = {
    'Họ và tên': 'Nguyễn An',
    Email: 'An@Example.com',
    'Mật khẩu': 'matkhau123',
    'Nhập lại mật khẩu': 'matkhau123',
    ...overrides,
  }
  for (const [label, value] of Object.entries(values)) await user.type(screen.getByLabelText(label), value)
}

describe('RegisterPage', () => {
  beforeEach(() => {
    register.mockReset()
    useAuthStore.getState().signOut()
  })

  it('báo lỗi và không gọi API khi form rỗng', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByText('Vui lòng nhập họ tên')).toBeInTheDocument()
    expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu tối thiểu 8 ký tự')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('báo lỗi khi mật khẩu nhập lại không khớp', async () => {
    const user = userEvent.setup()
    renderPage()
    await fillForm(user, { 'Nhập lại mật khẩu': 'khacmatkhau1' })
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('đăng ký thành công: chuẩn hóa dữ liệu, tự đăng nhập và quay lại trang cũ', async () => {
    register.mockResolvedValue(session)
    const user = userEvent.setup()
    renderPage({ from: '/builder' })
    await fillForm(user, { 'Số điện thoại (không bắt buộc)': '0901 234 567' })
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByText('Trang thiết kế')).toBeInTheDocument()
    expect(register).toHaveBeenCalledWith({
      fullName: 'Nguyễn An',
      email: 'an@example.com',
      password: 'matkhau123',
      phone: '0901234567',
    })
    expect(useAuthStore.getState().token).toBe('tok')
  })

  it('bỏ trống số điện thoại thì không gửi trường phone', async () => {
    register.mockResolvedValue(session)
    const user = userEvent.setup()
    renderPage()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    await screen.findByText('Trang chủ')
    expect(register.mock.calls[0]?.[0].phone).toBeUndefined()
  })

  it('email đã tồn tại: hiện lỗi của server và không lưu phiên', async () => {
    register.mockRejectedValue(new ApiError('Email đã được sử dụng', 409))
    const user = userEvent.setup()
    renderPage()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email đã được sử dụng')
    expect(useAuthStore.getState().token).toBeNull()
  })
})
