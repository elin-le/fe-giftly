import { z } from 'zod'

/** Số điện thoại di động VN: 0xxxxxxxxx hoặc +84xxxxxxxxx. */
const PHONE_PATTERN = /^(0|\+84)\d{9}$/

/** Bỏ khoảng trắng, dấu chấm, gạch ngang người dùng hay gõ vào. */
export const normalizePhone = (value: string): string => value.replace(/[\s.-]/g, '')

export const isVnPhone = (value: string): boolean => PHONE_PATTERN.test(normalizePhone(value))

/** Bắt buộc nhập; trả về số đã chuẩn hóa. */
export const phoneSchema = z
  .string()
  .refine(isVnPhone, 'Số điện thoại không hợp lệ')
  .transform(normalizePhone)

/** Không bắt buộc: để trống là hợp lệ (trả về chuỗi rỗng). */
export const optionalPhoneSchema = z
  .string()
  .refine((value) => value.trim() === '' || isVnPhone(value), 'Số điện thoại không hợp lệ')
  .transform((value) => (value.trim() === '' ? '' : normalizePhone(value)))
