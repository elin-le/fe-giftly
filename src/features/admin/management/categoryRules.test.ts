import { validateCategory } from './categoryRules'

const others = [{ name: 'Sinh nhật' }]

describe('validateCategory', () => {
  it('hợp lệ', () => expect(validateCategory({ name: 'Tết', description: null }, others)).toBeNull())
  it('tên quá ngắn, toàn khoảng trắng, quá dài', () => {
    expect(validateCategory({ name: 'A', description: null }, others)).toMatch(/tối thiểu/)
    expect(validateCategory({ name: '   ', description: null }, others)).toMatch(/tối thiểu/)
    expect(validateCategory({ name: 'x'.repeat(61), description: null }, others)).toMatch(/tối đa/)
  })
  it('trùng tên (không phân biệt hoa thường, khoảng trắng đầu cuối)', () => {
    expect(validateCategory({ name: '  SINH NHẬT ', description: null }, others)).toMatch(/đã tồn tại/)
  })
  it('mô tả quá dài', () => expect(validateCategory({ name: 'Tết', description: 'x'.repeat(201) }, others)).toMatch(/Mô tả/))
})
