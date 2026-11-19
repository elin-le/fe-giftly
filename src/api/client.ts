import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toApiError } from './errors'

/** Axios instance dùng chung cho toàn bộ giao tiếp FE ↔ BE. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    // Token hết hạn/không hợp lệ: đăng xuất để các route được bảo vệ đưa người dùng về trang đăng nhập.
    // Không đăng xuất khi chưa có token (vd. đăng nhập sai mật khẩu cũng trả 401).
    if (apiError.status === 401 && useAuthStore.getState().token) useAuthStore.getState().signOut()
    return Promise.reject(apiError)
  },
)
