import { addressSchema, toAddressInput } from './addressSchema'

const valid = {
  recipientName: '  Nguyễn An  ',
  phone: '090 123-4567',
  addressLine: '12 Lê Lợi',
  ward: '',
  district: '',
  city: 'TP. Hồ Chí Minh',
  isDefault: false,
}

describe('addressSchema', () => {
  it('chấp nhận dữ liệu hợp lệ, cắt khoảng trắng và chuẩn hoá số điện thoại', () => {
    const parsed = addressSchema.parse(valid)
    expect(parsed.recipientName).toBe('Nguyễn An')
    expect(parsed.phone).toBe('0901234567')
  })

  it('chấp nhận số +84', () => {
    expect(addressSchema.safeParse({ ...valid, phone: '+84901234567' }).success).toBe(true)
  })

  it.each([
    ['tên toàn khoảng trắng', { recipientName: '   ' }],
    ['tên 1 ký tự', { recipientName: 'A' }],
    ['số điện thoại thiếu số', { phone: '090123' }],
    ['số điện thoại có chữ', { phone: '09012345ab' }],
    ['địa chỉ quá ngắn', { addressLine: '12' }],
    ['địa chỉ toàn khoảng trắng', { addressLine: '        ' }],
    ['địa chỉ quá dài', { addressLine: 'a'.repeat(201) }],
    ['thành phố quá dài', { city: 'a'.repeat(101) }],
  ])('từ chối %s', (_label, override) => {
    expect(addressSchema.safeParse({ ...valid, ...override }).success).toBe(false)
  })

  it('toAddressInput đổi ô trống thành null', () => {
    expect(toAddressInput(addressSchema.parse(valid))).toMatchObject({ ward: null, district: null, city: 'TP. Hồ Chí Minh' })
  })
})
