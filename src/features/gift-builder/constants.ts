export const MESSAGE_MAX_LENGTH = 200

/** Giới hạn an toàn khi hộp/món thiếu số đo (lòng hộp hoặc kích thước/khối lượng chưa nhập). */
export const MAX_CONTENT_ITEMS = 30

/** Vượt sức chứa (khối lượng / thể tích) tới mức này vẫn cho thêm vào giỏ — admin xem xét và liên hệ khách. */
export const OVERFLOW_TOLERANCE = 0.2

/** Hộp trống quá nửa (< ngưỡng này) thì nhắc khách thêm món. */
export const UNDERFILL_THRESHOLD = 0.35
