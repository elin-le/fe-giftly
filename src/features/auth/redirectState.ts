/** Dữ liệu đính kèm khi chuyển người dùng sang trang đăng nhập (qua `location.state`). */
export interface AuthRedirectState {
  /** Trang cần quay lại sau khi đăng nhập. */
  from?: string
  /** Lý do hiển thị trên trang đăng nhập, vd. "Vui lòng đăng nhập để …". */
  reason?: string
}

/**
 * `location.state` là dữ liệu ngoài (người dùng có thể sửa lịch sử trình duyệt) nên phải kiểm tra:
 * `from` chỉ nhận đường dẫn nội bộ, tránh chuyển hướng ra trang khác.
 */
export function readRedirectState(state: unknown): AuthRedirectState {
  if (typeof state !== 'object' || state === null) return {}
  const { from, reason } = state as Record<string, unknown>

  const isInternalPath = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
  return {
    from: isInternalPath ? from : undefined,
    reason: typeof reason === 'string' && reason.trim() !== '' ? reason : undefined,
  }
}
