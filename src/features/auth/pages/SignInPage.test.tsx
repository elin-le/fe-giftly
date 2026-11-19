import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '../api/authApi'
import type { AuthSession } from '../types'
import { SignInPage } from './SignInPage'

vi.mock('../api/authApi', () => ({ authApi: { signIn: vi.fn(), register: vi.fn() } }))

const signIn = vi.mocked(authApi.signIn)

const customerSession: AuthSession = {
  token: 'tok',
  user: { id: 'u1', email: 'user@giftly.vn', fullName: 'Minh Anh', phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] },
}
const adminSession: AuthSession = {
  token: 'adm',
  user: { ...customerSession.user, id: 'u2', fullName: 'Quản trị', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
}

const renderPage = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/signin', state }]}>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<p>Trang đăng ký</p>} />
        <Route path="/cart" element={<p>Trang giỏ hàng</p>} />
        <Route path="/admin" element={<p>Trang quản trị</p>} />
        <Route path="/" element={<p>Trang chủ</p>} />
      </Routes>
    </MemoryRouter>,
  )

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email = 'user@giftly.vn', password = 'User@123') {
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Mật khẩu'), password)
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))
}

describe('SignInPage', () => {
  beforeEach(() => {
    signIn.mockReset()
    useAuthStore.getState().signOut()
  })

  it('báo lỗi từng trường và không gọi API khi form rỗng', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('đăng nhập thành công: lưu phiên và quay lại trang đang định vào', async () => {
    signIn.mockResolvedValue(customerSession)
    const user = userEvent.setup()
    renderPage({ from: '/cart' })
    await fillAndSubmit(user)

    expect(await screen.findByText('Trang giỏ hàng')).toBeInTheDocument()
    expect(signIn).toHaveBeenCalledWith({ email: 'user@giftly.vn', password: 'User@123' })
    expect(useAuthStore.getState().token).toBe('tok')
  })

  it('không có trang quay lại: khách hàng về trang chủ, quản trị viên về /admin', async () => {
    signIn.mockResolvedValue(customerSession)
    const first = renderPage()
    await fillAndSubmit(userEvent.setup())
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    first.unmount()

    useAuthStore.getState().signOut()
    signIn.mockResolvedValue(adminSession)
    renderPage()
    await fillAndSubmit(userEvent.setup(), 'admin@giftly.vn', 'Admin@123')
    expect(await screen.findByText('Trang quản trị')).toBeInTheDocument()
  })

  it('hiển thị lý do khi bị chuyển tới từ một hành động cần đăng nhập', () => {
    renderPage({ from: '/products', reason: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.' })
    expect(screen.getByRole('status')).toHaveTextContent('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
  })

  it('sai mật khẩu: hiện lỗi của server và không lưu phiên', async () => {
    signIn.mockRejectedValue(new ApiError('Email hoặc mật khẩu không đúng', 401))
    const user = userEvent.setup()
    renderPage()
    await fillAndSubmit(user, 'user@giftly.vn', 'saimatkhau')

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không đúng')
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('chặn gửi lặp khi đang đăng nhập', async () => {
    let resolve: (session: AuthSession) => void = () => undefined
    signIn.mockReturnValue(new Promise((done) => (resolve = done)))
    const user = userEvent.setup()
    renderPage()
    await fillAndSubmit(user)

    const busy = await screen.findByRole('button', { name: 'Đang đăng nhập…' })
    expect(busy).toBeDisabled()
    await user.click(busy)
    expect(signIn).toHaveBeenCalledTimes(1)

    resolve(customerSession)
    await waitFor(() => expect(useAuthStore.getState().token).toBe('tok'))
  })

  it('đã đăng nhập thì không ở lại trang đăng nhập', () => {
    useAuthStore.getState().setSession(customerSession)
    renderPage({ from: '/cart' })
    expect(screen.getByText('Trang giỏ hàng')).toBeInTheDocument()
  })

  it('cho hiện/ẩn mật khẩu', async () => {
    const user = userEvent.setup()
    renderPage()
    const input = screen.getByLabelText('Mật khẩu')
    expect(input).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('có liên kết sang trang đăng ký', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('link', { name: 'Đăng ký' }))
    expect(await screen.findByText('Trang đăng ký')).toBeInTheDocument()
  })
})
