import { registerSchema, signInSchema } from './authSchemas'

const validRegister = {
  fullName: 'Nguyễn An',
  email: ' An@Example.COM ',
  phone: '0901 234 567',
  password: 'matkhau123',
  confirmPassword: 'matkhau123',
}

describe('signInSchema', () => {
  it('chuẩn hóa email (cắt khoảng trắng, chữ thường)', () => {
    const result = signInSchema.parse({ email: '  An@Example.com ', password: 'x' })
    expect(result.email).toBe('an@example.com')
  })

  it('từ chối email sai định dạng hoặc mật khẩu rỗng', () => {
    expect(signInSchema.safeParse({ email: 'abc', password: 'x' }).success).toBe(false)
    expect(signInSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('chấp nhận dữ liệu hợp lệ và chuẩn hóa email, số điện thoại', () => {
    const result = registerSchema.parse(validRegister)
    expect(result).toMatchObject({ email: 'an@example.com', phone: '0901234567' })
  })

  it('cho phép bỏ trống số điện thoại', () => {
    expect(registerSchema.safeParse({ ...validRegister, phone: '' }).success).toBe(true)
  })

  it.each([
    ['quá ngắn', 'a1'],
    ['thiếu chữ số', 'chuaconso'],
    ['thiếu chữ cái', '12345678'],
    ['quá dài', 'a1'.repeat(40)],
  ])('từ chối mật khẩu %s', (_label, password) => {
    expect(registerSchema.safeParse({ ...validRegister, password, confirmPassword: password }).success).toBe(false)
  })

  it('báo lỗi ở ô nhập lại khi hai mật khẩu không khớp', () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: 'khac12345' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
  })

  it('từ chối họ tên toàn khoảng trắng và số điện thoại sai', () => {
    expect(registerSchema.safeParse({ ...validRegister, fullName: '   ' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...validRegister, phone: '123' }).success).toBe(false)
  })
})
