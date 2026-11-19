import axios from 'axios'

/** Lỗi thống nhất mà toàn bộ UI nhận được, bất kể nguồn gốc. */
export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const FALLBACK_MESSAGE = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'

/** Chuyển mọi lỗi (Axios hoặc không) thành ApiError có thông điệp thân thiện. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: unknown } | undefined)?.message
    const message = typeof serverMessage === 'string' ? serverMessage : FALLBACK_MESSAGE
    return new ApiError(message, error.response?.status ?? null)
  }

  return new ApiError(error instanceof Error ? error.message : FALLBACK_MESSAGE)
}
