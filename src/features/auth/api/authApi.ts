import { apiClient } from '@/api/client'
import { ensureObject } from '@/api/ensureObject'
import type { AuthSession, RegisterPayload, SignInPayload } from '../types'

const toSession = (data: unknown): AuthSession => ensureObject<AuthSession>(data, ['token', 'user'])

export const authApi = {
  signIn: (payload: SignInPayload) => apiClient.post<unknown>('/auth/login', payload).then((res) => toSession(res.data)),

  /** Đăng ký xong được đăng nhập luôn. */
  register: (payload: RegisterPayload) =>
    apiClient.post<unknown>('/auth/register', payload).then((res) => toSession(res.data)),
}
