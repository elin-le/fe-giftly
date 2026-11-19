import { renderHook, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/stores/authStore'
import { cartApi } from '../api/cartApi'
import { useCartStore } from '../cartStore'
import { makeCart, makeVariantItem } from '../testUtils'
import { useCartSync } from './useCartSync'

vi.mock('../api/cartApi', () => ({ cartApi: { get: vi.fn() } }))

const user = (id: string) =>
  ({ id, email: `${id}@b.co`, fullName: id, phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] }) as const

describe('useCartSync', () => {
  beforeEach(() => {
    vi.mocked(cartApi.get).mockReset()
    useAuthStore.getState().signOut()
    useCartStore.getState().reset()
  })

  it('chưa đăng nhập thì không tải giỏ hàng', () => {
    renderHook(() => useCartSync())
    expect(cartApi.get).not.toHaveBeenCalled()
  })

  it('đăng nhập thì tải giỏ của người đó; đăng xuất thì xoá giỏ đang giữ', async () => {
    vi.mocked(cartApi.get).mockResolvedValue(makeCart([makeVariantItem()]))
    renderHook(() => useCartSync())

    useAuthStore.getState().setSession({ token: 't', user: { ...user('u1'), roles: ['ROLE_USER'] } })
    await waitFor(() => expect(useCartStore.getState().cart?.items).toHaveLength(1))

    useAuthStore.getState().signOut()
    await waitFor(() => expect(useCartStore.getState().cart).toBeNull())
  })

  it('đổi sang tài khoản khác thì tải lại giỏ, không giữ giỏ của người trước', async () => {
    vi.mocked(cartApi.get)
      .mockResolvedValueOnce(makeCart([makeVariantItem({ id: 'của-u1' })]))
      .mockResolvedValueOnce(makeCart([]))
    renderHook(() => useCartSync())

    useAuthStore.getState().setSession({ token: 't1', user: { ...user('u1'), roles: ['ROLE_USER'] } })
    await waitFor(() => expect(useCartStore.getState().cart?.items).toHaveLength(1))

    useAuthStore.getState().setSession({ token: 't2', user: { ...user('u2'), roles: ['ROLE_USER'] } })
    await waitFor(() => expect(useCartStore.getState().cart?.items).toHaveLength(0))
    expect(cartApi.get).toHaveBeenCalledTimes(2)
  })
})
