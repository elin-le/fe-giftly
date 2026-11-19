import { ApiError } from './errors'

/** Đảm bảo phản hồi danh sách đúng là mảng; backend lỗi/sai URL có thể trả HTML hoặc object. */
export function ensureArray<T>(data: unknown): T[] {
  if (!Array.isArray(data)) throw new ApiError('Phản hồi từ máy chủ không hợp lệ.')
  return data as T[]
}
