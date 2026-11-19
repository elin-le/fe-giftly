import type { User } from '@/features/auth/types'
import { selectIsAdmin, selectIsAuthenticated, useAuthStore } from './authStore'

const customer: User = {
  id: 'u1',
  email: 'an@example.com',
  fullName: 'An',
  phone: null,
  status: 'ACTIVE',
  roles: ['ROLE_USER'],
}
const admin: User = { ...customer, id: 'u2', roles: ['ROLE_USER', 'ROLE_ADMIN'] }

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().signOut())

  it('bắt đầu ở trạng thái chưa đăng nhập', () => {
    const state = useAuthStore.getState()
    expect(selectIsAuthenticated(state)).toBe(false)
    expect(selectIsAdmin(state)).toBe(false)
  })

  it('lưu phiên và nhận diện khách hàng thường', () => {
    useAuthStore.getState().setSession({ token: 't', user: customer })
    const state = useAuthStore.getState()
    expect(selectIsAuthenticated(state)).toBe(true)
    expect(selectIsAdmin(state)).toBe(false)
  })

  it('nhận diện quản trị viên', () => {
    useAuthStore.getState().setSession({ token: 't', user: admin })
    expect(selectIsAdmin(useAuthStore.getState())).toBe(true)
  })

  it('đăng xuất xoá token và người dùng', () => {
    useAuthStore.getState().setSession({ token: 't', user: customer })
    useAuthStore.getState().signOut()
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null })
  })

  it('chỉ có token mà thiếu người dùng thì chưa tính là đã đăng nhập', () => {
    expect(selectIsAuthenticated({ token: 't', user: null })).toBe(false)
  })

  it('lưu phiên vào localStorage để giữ đăng nhập khi tải lại', () => {
    useAuthStore.getState().setSession({ token: 't', user: customer })
    const stored = JSON.parse(localStorage.getItem('giftly-auth') ?? '{}') as { state?: { token?: string } }
    expect(stored.state?.token).toBe('t')
  })
})
