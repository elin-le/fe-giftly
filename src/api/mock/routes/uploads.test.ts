import { uploadsApi } from '@/features/products/api/uploadsApi'
import { setupMock, signInAs } from '../testUtils'

const png = (size = 8, type = 'image/png') => new File([new Uint8Array(size)], 'a.png', { type })

describe('mock API · uploads', () => {
  beforeEach(() => setupMock())

  it('admin tải ảnh và nhận đường dẫn dùng được ngay', async () => {
    await signInAs('admin')
    const uploaded = await uploadsApi.image(png())
    expect(uploaded.secureUrl).toMatch(/^data:image\/png;base64,/)
    expect(uploaded.publicId).toMatch(/^upload\//)
  })

  it('từ chối tệp không phải ảnh', async () => {
    await signInAs('admin')
    await expect(uploadsApi.image(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).rejects.toThrow(/Chỉ nhận ảnh/)
  })

  it('khách thường không được tải ảnh sản phẩm', async () => {
    await signInAs('customer')
    await expect(uploadsApi.image(png())).rejects.toThrow()
  })
})
