import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuthGate } from './useAuthGate'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/products?category=x']}>{children}</MemoryRouter>
)

const customer = { id: 'u1', email: 'a@b.co', fullName: 'An', phone: null, status: 'ACTIVE', roles: ['ROLE_USER'] } as const

function renderGate() {
  return renderHook(() => ({ gate: useAuthGate(), location: useLocation() }), { wrapper })
}

describe('useAuthGate', () => {
  beforeEach(() => useAuthStore.getState().signOut())

  it('chưa đăng nhập: không chạy hành động, chuyển tới /signin kèm lý do và trang quay lại', () => {
    const action = vi.fn()
    const { result } = renderGate()

    act(() => result.current.gate('Vui lòng đăng nhập để thêm vào giỏ.', action))

    expect(action).not.toHaveBeenCalled()
    expect(result.current.location.pathname).toBe('/signin')
    expect(result.current.location.state).toEqual({
      from: '/products?category=x',
      reason: 'Vui lòng đăng nhập để thêm vào giỏ.',
    })
  })

  it('đã đăng nhập: chạy hành động và ở nguyên trang', () => {
    useAuthStore.getState().setSession({ token: 't', user: { ...customer, roles: ['ROLE_USER'] } })
    const action = vi.fn()
    const { result } = renderGate()

    act(() => result.current.gate('lý do', action))

    expect(action).toHaveBeenCalledTimes(1)
    expect(result.current.location.pathname).toBe('/products')
  })
})
