import MockAdapter from 'axios-mock-adapter'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from './client'
import { ApiError } from './errors'

const user = { id: 'u1', email: 'a@b.co', fullName: 'An', phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] } as const

describe('apiClient', () => {
  const mock = new MockAdapter(apiClient)
  beforeEach(() => useAuthStore.getState().signOut())
  afterEach(() => mock.reset())

  it('đính kèm Bearer token của phiên đăng nhập', async () => {
    useAuthStore.getState().setSession({ token: 'abc', user: { ...user, roles: ['ROLE_USER'] } })
    mock.onGet('/ping').reply((config) => [200, { auth: config.headers?.Authorization }])
    const { data } = await apiClient.get('/ping')
    expect(data.auth).toBe('Bearer abc')
  })

  it('không đính kèm Authorization khi chưa đăng nhập', async () => {
    mock.onGet('/ping').reply((config) => [200, { auth: config.headers?.Authorization ?? null }])
    const { data } = await apiClient.get('/ping')
    expect(data.auth).toBeNull()
  })

  it('chuẩn hóa lỗi thành ApiError', async () => {
    mock.onGet('/boom').reply(500, { message: 'Lỗi máy chủ' })
    await expect(apiClient.get('/boom')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Lỗi máy chủ',
      status: 500,
    })
    await expect(apiClient.get('/boom')).rejects.toBeInstanceOf(ApiError)
  })

  it('401 khi đang đăng nhập (token hết hạn) thì tự đăng xuất', async () => {
    useAuthStore.getState().setSession({ token: 'old', user: { ...user, roles: ['ROLE_USER'] } })
    mock.onGet('/cart').reply(401, { message: 'Phiên đăng nhập đã hết hạn' })
    await expect(apiClient.get('/cart')).rejects.toMatchObject({ status: 401 })
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('403 không làm mất phiên đăng nhập', async () => {
    useAuthStore.getState().setSession({ token: 'ok', user: { ...user, roles: ['ROLE_USER'] } })
    mock.onGet('/orders').reply(403, { message: 'Không đủ quyền' })
    await expect(apiClient.get('/orders')).rejects.toMatchObject({ status: 403 })
    expect(useAuthStore.getState().token).toBe('ok')
  })
})
