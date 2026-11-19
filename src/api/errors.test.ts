import { AxiosError } from 'axios'
import { ApiError, toApiError } from './errors'

describe('toApiError', () => {
  it('giữ nguyên ApiError', () => {
    const original = new ApiError('x', 400)
    expect(toApiError(original)).toBe(original)
  })

  it('lấy message và status từ phản hồi của server', () => {
    const axiosError = new AxiosError('fail', 'ERR', undefined, undefined, {
      status: 422,
      data: { message: 'Dữ liệu không hợp lệ' },
    } as never)
    const result = toApiError(axiosError)
    expect(result.message).toBe('Dữ liệu không hợp lệ')
    expect(result.status).toBe(422)
  })

  it('dùng thông điệp mặc định khi mất kết nối', () => {
    const result = toApiError(new AxiosError('Network Error'))
    expect(result.status).toBeNull()
    expect(result.message).toMatch(/kết nối/)
  })

  it('xử lý lỗi thường và giá trị lạ', () => {
    expect(toApiError(new Error('oops')).message).toBe('oops')
    expect(toApiError('???').message).toMatch(/kết nối/)
  })
})
