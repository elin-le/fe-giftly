import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { cartApi } from '@/features/cart/api/cartApi'
import { makeCart } from '@/features/cart/testUtils'
import { productsApi } from '@/features/products/api/productsApi'
import { useAuthStore } from '@/stores/authStore'
import { appRoutes } from './router'

vi.mock('@/features/cart/api/cartApi', () => ({ cartApi: { get: vi.fn() } }))
vi.mock('@/features/products/api/productsApi', () => ({ productsApi: { list: vi.fn(), categories: vi.fn() } }))
vi.mock('@/features/orders/api/ordersApi', () => ({ ordersApi: { listMine: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/features/addresses/api/addressesApi', () => ({ addressesApi: { list: vi.fn().mockResolvedValue([]) } }))

const customer = { id: 'u1', email: 'an@example.com', fullName: 'An', phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] } as const

const renderAt = (path: string) => {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('router · bảo vệ route', () => {
  beforeEach(() => {
    useAuthStore.getState().signOut()
    vi.mocked(cartApi.get).mockResolvedValue(makeCart())
    vi.mocked(productsApi.list).mockResolvedValue([])
    vi.mocked(productsApi.categories).mockResolvedValue([])
  })

  it.each(['/cart', '/checkout', '/orders'])('chưa đăng nhập: %s chuyển tới /signin và nhớ trang cần quay lại', async (path) => {
    const router = renderAt(path)
    expect(await screen.findByRole('heading', { name: /Đăng nhập/ })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/signin')
    expect(router.state.location.state).toMatchObject({ from: path })
  })

  it('chưa đăng nhập: /admin chuyển tới /signin', async () => {
    const router = renderAt('/admin/products')
    expect(await screen.findByRole('heading', { name: /Đăng nhập/ })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/signin')
  })

  it('khách hàng thường vào /admin thấy trang 403', async () => {
    useAuthStore.getState().setSession({ token: 't', user: { ...customer, roles: ['ROLE_USER'] } })
    renderAt('/admin/products')
    expect(await screen.findByRole('heading', { name: 'Bạn không có quyền truy cập' })).toBeInTheDocument()
  })

  it('đã đăng nhập: vào được /orders và giỏ hàng được tải', async () => {
    useAuthStore.getState().setSession({ token: 't', user: { ...customer, roles: ['ROLE_USER'] } })
    renderAt('/orders')
    expect(await screen.findByRole('heading', { name: 'Đơn hàng của tôi' })).toBeInTheDocument()
    expect(cartApi.get).toHaveBeenCalled()
  })

  it('trang cửa hàng và trình thiết kế hộp quà xem được khi chưa đăng nhập', async () => {
    renderAt('/products')
    expect(await screen.findByRole('heading', { name: 'Cửa hàng' })).toBeInTheDocument()
  })

  it('có trang đăng ký công khai', async () => {
    renderAt('/register')
    expect(await screen.findByRole('heading', { name: /Đăng ký|Tạo tài khoản/ })).toBeInTheDocument()
  })
})
