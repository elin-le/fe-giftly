import { ApiError } from './errors'

/**
 * Đảm bảo phản hồi là object có đủ các khoá bắt buộc.
 * Backend lỗi/sai URL có thể trả HTML hoặc object rỗng; thà báo lỗi rõ ràng còn hơn để UI sập.
 */
export function ensureObject<T extends object>(data: unknown, requiredKeys: readonly (keyof T & string)[]): T {
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data)
  if (!isObject || requiredKeys.some((key) => !(key in data))) {
    throw new ApiError('Phản hồi từ máy chủ không hợp lệ.')
  }
  return data as T
}
