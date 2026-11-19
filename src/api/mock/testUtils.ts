import { authApi } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/stores/authStore'
import { installMockApi } from './index'

export const CREDENTIALS = {
  customer: { email: 'user@giftly.vn', password: 'User@123' },
  admin: { email: 'admin@giftly.vn', password: 'Admin@123' },
} as const

/** Dựng backend giả lập mới (không độ trễ) và đăng xuất khỏi phiên cũ. */
export function setupMock(): void {
  installMockApi({ latencyMs: 0, demoHistory: false })
  useAuthStore.getState().signOut()
}

/** Đăng nhập bằng tài khoản demo; các request sau tự gắn token. */
export async function signInAs(who: keyof typeof CREDENTIALS): Promise<void> {
  useAuthStore.getState().setSession(await authApi.signIn(CREDENTIALS[who]))
}

/** Đăng ký tài khoản mới (đăng nhập luôn) để kiểm tra dữ liệu tách biệt giữa người dùng. */
export async function registerAndSignIn(email = 'moi@example.com'): Promise<void> {
  useAuthStore.getState().setSession(await authApi.register({ fullName: 'Người Mới', email, password: 'Matkhau123' }))
}
