import { authApi } from '@/features/auth/api/authApi'
import { cartApi } from '@/features/cart/api/cartApi'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '../../client'
import { installMockApi } from '../index'
import { CREDENTIALS, setupMock } from '../testUtils'

describe('mock API · xác thực', () => {
  beforeEach(setupMock)

  it('tải lại trang (mock khởi tạo lại): token của tài khoản mẫu vẫn dùng được, token rác thì không', async () => {
    useAuthStore.getState().setSession(await authApi.signIn(CREDENTIALS.customer))
    installMockApi({ latencyMs: 0, demoHistory: false })
    await expect(cartApi.get()).resolves.toMatchObject({ items: [] })

    useAuthStore.getState().setSession({ token: 'mock.khong-co-nguoi-dung.x', user: useAuthStore.getState().user! })
    await expect(cartApi.get()).rejects.toMatchObject({ status: 401 })
  })

  it('đăng nhập đúng: trả token và người dùng (không lộ mật khẩu)', async () => {
    const session = await authApi.signIn(CREDENTIALS.customer)
    expect(session.token).toBeTruthy()
    expect(session.user).toMatchObject({ email: 'user@giftly.vn', roles: ['ROLE_USER'], status: 'ACTIVE' })
    expect(session.user).not.toHaveProperty('password')
  })

  it('không phân biệt hoa/thường và khoảng trắng của email', async () => {
    const session = await authApi.signIn({ email: '  USER@Giftly.vn ', password: 'User@123' })
    expect(session.user.email).toBe('user@giftly.vn')
  })

  it.each([
    ['sai mật khẩu', { email: 'user@giftly.vn', password: 'sai' }],
    ['email không tồn tại', { email: 'khong@giftly.vn', password: 'User@123' }],
  ])('từ chối khi %s (401)', async (_label, payload) => {
    await expect(authApi.signIn(payload)).rejects.toMatchObject({ status: 401, message: 'Email hoặc mật khẩu không đúng' })
  })

  it.each([
    ['INACTIVE', 'inactive@giftly.vn', 'Inactive@123', 'không còn hoạt động'],
    ['SUSPENDED', 'suspended@giftly.vn', 'Suspended@123', 'tạm khoá'],
  ])('tài khoản %s không đăng nhập được (403)', async (_status, email, password, text) => {
    await expect(authApi.signIn({ email, password })).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining(text),
    })
  })

  it('đăng ký: tạo tài khoản ROLE_USER, đăng nhập luôn và dùng được token', async () => {
    const session = await authApi.register({ fullName: ' An ', email: 'An@Example.com', password: 'Matkhau123', phone: '0912345678' })
    expect(session.user).toMatchObject({ fullName: 'An', email: 'an@example.com', phone: '0912345678', roles: ['ROLE_USER'] })

    const { data } = await apiClient.get('/addresses', { headers: { Authorization: `Bearer ${session.token}` } })
    expect(data).toEqual([])
    await expect(authApi.signIn({ email: 'an@example.com', password: 'Matkhau123' })).resolves.toBeDefined()
  })

  it('đăng ký trùng email (kể cả khác hoa/thường) bị từ chối (409)', async () => {
    await expect(
      authApi.register({ fullName: 'Ai Đó', email: 'USER@giftly.vn', password: 'Matkhau123' }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it.each([
    ['mật khẩu quá ngắn', { fullName: 'An', email: 'a@b.co', password: '123' }],
    ['thiếu họ tên', { fullName: '  ', email: 'a@b.co', password: 'Matkhau123' }],
    ['email sai định dạng', { fullName: 'An', email: 'khong-phai-email', password: 'Matkhau123' }],
  ])('từ chối đăng ký khi %s (400)', async (_label, payload) => {
    await expect(authApi.register(payload)).rejects.toMatchObject({ status: 400 })
  })

  it('token không hợp lệ không được truy cập tài nguyên cần đăng nhập (401)', async () => {
    await expect(
      apiClient.get('/cart', { headers: { Authorization: 'Bearer gia-mao' } }),
    ).rejects.toMatchObject({ status: 401 })
  })
})
