import type { AxiosRequestConfig } from 'axios'
import type { Address } from '@/features/addresses/types'
import type { User } from '@/features/auth/types'
import type { MockDb } from './db'
import type { SeedAddress, SeedUser } from './data'

/** Kết quả trả về cho axios-mock-adapter: [status, body]. */
export type MockReply = [number, unknown?]
export type Handler = (config: AxiosRequestConfig) => MockReply | Promise<MockReply>

export const fail = (status: number, message: string): MockReply => [status, { message }]

export function parseBody<T extends object>(config: AxiosRequestConfig): T {
  const raw: unknown = config.data
  if (typeof raw === 'string' && raw !== '') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return {} as T
    }
  }
  return (raw ?? {}) as T
}

/** Phần tử cuối của đường dẫn, bỏ query string. */
export const lastSegment = (url = ''): string => url.split('?')[0]?.split('/').pop() ?? ''

export const toUser = ({ id, email, fullName, phone, status, roles }: SeedUser): User => ({
  id, email, fullName, phone, status, roles: [...roles],
})

export const toAddress = ({ userId: _userId, ...address }: SeedAddress): Address => address

/**
 * Token mock có dạng `mock.<userId>.<ngẫu nhiên>`. Sau khi tải lại trang bộ nhớ của mock bị xoá nhưng token
 * vẫn nằm ở localStorage, nên khôi phục userId từ token để tài khoản mẫu không bị đăng xuất; tài khoản
 * tự đăng ký không còn tồn tại sẽ không khớp người dùng nào → 401.
 */
const userIdFromToken = (token: string): string | undefined => /^mock\.([^.]+)\./.exec(token)?.[1]

function authenticate(config: AxiosRequestConfig, db: MockDb): SeedUser | null {
  const header = (config.headers as Record<string, unknown> | undefined)?.Authorization
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length)
  const userId = db.sessions.get(token) ?? userIdFromToken(token)
  const user = db.users.find((candidate) => candidate.id === userId)
  return user?.status === 'ACTIVE' ? user : null
}

type UserHandler = (user: SeedUser, config: AxiosRequestConfig) => MockReply | Promise<MockReply>

/** Chỉ cho phép người dùng đã đăng nhập (token hợp lệ, tài khoản ACTIVE). */
export const withUser =
  (db: MockDb, handler: UserHandler): Handler =>
  (config) => {
    const user = authenticate(config, db)
    return user ? handler(user, config) : fail(401, 'Vui lòng đăng nhập để tiếp tục')
  }

/** Chỉ cho phép ROLE_ADMIN. */
export const withAdmin =
  (db: MockDb, handler: UserHandler): Handler =>
  withUser(db, (user, config) =>
    user.roles.includes('ROLE_ADMIN') ? handler(user, config) : fail(403, 'Bạn không có quyền thực hiện thao tác này'),
  )
