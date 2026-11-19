export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

/** Lỗi (tiếng Việt) nếu tệp không dùng được làm ảnh sản phẩm; `null` nếu hợp lệ. */
export function validateImageFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return 'Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF'
  if (file.size === 0) return 'Tệp ảnh trống'
  if (file.size > MAX_IMAGE_BYTES) return `Ảnh quá lớn (tối đa ${MAX_IMAGE_BYTES / 1024 / 1024} MB)`
  return null
}

/** Đường dẫn ảnh hợp lệ: http(s) hoặc ảnh tải lên dạng data URL (mock). */
export const isImageUrl = (value: string): boolean => /^(https?:\/\/\S+|data:image\/[a-z+.-]+;\S+)$/i.test(value)
