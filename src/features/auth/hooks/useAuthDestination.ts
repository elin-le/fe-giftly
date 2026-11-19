import { useLocation } from 'react-router-dom'
import { selectIsAdmin, useAuthStore } from '@/stores/authStore'
import { readRedirectState } from '../redirectState'

/** Nơi người dùng được đưa tới sau khi đăng nhập/đăng ký, và lý do (nếu bị chuyển tới đây). */
export function useAuthDestination(): { destination: string; reason?: string } {
  const { state } = useLocation()
  const isAdmin = useAuthStore(selectIsAdmin)
  const { from, reason } = readRedirectState(state)

  return { destination: from ?? (isAdmin ? '/admin' : '/'), reason }
}
