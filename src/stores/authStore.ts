import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, User } from '@/features/auth/types'

interface AuthState {
  token: string | null
  user: User | null
  setSession: (session: AuthSession) => void
  signOut: () => void
}

/**
 * Phiên đăng nhập dùng chung toàn app (Axios đọc token từ đây).
 * Lưu `localStorage` để giữ đăng nhập khi tải lại trang.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
    }),
    {
      name: 'giftly-auth',
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
)

type AuthSnapshot = Pick<AuthState, 'token' | 'user'>

export const selectIsAuthenticated = ({ token, user }: AuthSnapshot): boolean => token !== null && user !== null

export const selectIsAdmin = ({ user }: AuthSnapshot): boolean => user?.roles.includes('ROLE_ADMIN') ?? false
