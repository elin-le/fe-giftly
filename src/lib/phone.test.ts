import { isVnPhone, normalizePhone, optionalPhoneSchema, phoneSchema } from './phone'

describe('phone', () => {
  it('chuẩn hóa khoảng trắng, dấu chấm, gạch ngang', () => {
    expect(normalizePhone('0901 234.567')).toBe('0901234567')
    expect(normalizePhone('+84-901-234-567')).toBe('+84901234567')
  })

  it.each(['0901234567', '+84901234567', '0901 234 567'])('chấp nhận %s', (value) => {
    expect(isVnPhone(value)).toBe(true)
  })

  it.each(['', '123', '090123456', '09012345678', 'abcdefghij', '+8490123456', ' '])('từ chối "%s"', (value) => {
    expect(isVnPhone(value)).toBe(false)
  })

  it('phoneSchema trả về số đã chuẩn hóa và bắt buộc nhập', () => {
    expect(phoneSchema.parse('0901 234 567')).toBe('0901234567')
    expect(phoneSchema.safeParse('').success).toBe(false)
  })

  it('optionalPhoneSchema cho phép trống nhưng vẫn kiểm tra khi có nhập', () => {
    expect(optionalPhoneSchema.parse('')).toBe('')
    expect(optionalPhoneSchema.parse('   ')).toBe('')
    expect(optionalPhoneSchema.parse('0901 234 567')).toBe('0901234567')
    expect(optionalPhoneSchema.safeParse('12345').success).toBe(false)
  })
})
