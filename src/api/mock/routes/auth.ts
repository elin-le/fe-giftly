import type MockAdapter from 'axios-mock-adapter'
import type { AuthSession, RegisterPayload, SignInPayload } from '@/features/auth/types'
import type { SeedUser } from '../data'
import { newId, type MockDb } from '../db'
import { fail, parseBody, toUser } from '../http'

const normalizeEmail = (email: unknown): string => (typeof email === 'string' ? email.trim().toLowerCase() : '')

function openSession(db: MockDb, user: SeedUser): AuthSession {
  const token = `mock.${user.id}.${newId()}`
  db.sessions.set(token, user.id)
  return { token, user: toUser(user) }
}

const BLOCKED_MESSAGES = {
  SUSPENDED: 'Tài khoản đang bị tạm khoá. Vui lòng liên hệ Giftly để được hỗ trợ.',
  INACTIVE: 'Tài khoản không còn hoạt động. Vui lòng liên hệ Giftly để được hỗ trợ.',
} as const

export function registerAuthRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = parseBody<SignInPayload>(config)
    const user = db.users.find((candidate) => candidate.email === normalizeEmail(email))
    if (!user || user.password !== password) return fail(401, 'Email hoặc mật khẩu không đúng')
    if (user.status !== 'ACTIVE') return fail(403, BLOCKED_MESSAGES[user.status])
    return [200, openSession(db, user)]
  })

  mock.onPost('/auth/register').reply((config) => {
    const { fullName, email, password, phone } = parseBody<RegisterPayload>(config)
    const normalizedEmail = normalizeEmail(email)

    if (!fullName?.trim() || !normalizedEmail.includes('@')) return fail(400, 'Thông tin đăng ký không hợp lệ')
    if (typeof password !== 'string' || password.length < 8) return fail(400, 'Mật khẩu tối thiểu 8 ký tự')
    if (db.users.some((candidate) => candidate.email === normalizedEmail)) return fail(409, 'Email này đã được đăng ký')

    const user: SeedUser = {
      id: newId(),
      email: normalizedEmail,
      password,
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      status: 'ACTIVE',
      roles: ['ROLE_USER'],
    }
    db.users.push(user)
    return [201, openSession(db, user)]
  })
}
