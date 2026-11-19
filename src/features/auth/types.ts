export const ROLE_NAMES = ['ROLE_USER', 'ROLE_ADMIN'] as const
export type RoleName = (typeof ROLE_NAMES)[number]

export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export interface User {
  id: string
  email: string
  fullName: string
  phone: string | null
  status: UserStatus
  roles: RoleName[]
}

/** Phiên đăng nhập: JWT + thông tin người dùng. */
export interface AuthSession {
  token: string
  user: User
}

export interface SignInPayload {
  email: string
  password: string
}

export interface RegisterPayload extends SignInPayload {
  fullName: string
  phone?: string
}
