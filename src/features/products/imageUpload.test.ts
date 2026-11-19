import { MAX_IMAGE_BYTES, isImageUrl, validateImageFile } from './imageUpload'

describe('validateImageFile', () => {
  it('nhận ảnh hợp lệ', () => expect(validateImageFile({ type: 'image/png', size: 1000 })).toBeNull())
  it('từ chối sai loại, rỗng, quá lớn', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1000 })).toMatch(/Chỉ nhận ảnh/)
    expect(validateImageFile({ type: 'image/png', size: 0 })).toMatch(/trống/)
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toMatch(/quá lớn/)
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES })).toBeNull()
  })
})

describe('isImageUrl', () => {
  it('chấp nhận http(s) và data URL ảnh; từ chối còn lại', () => {
    expect(isImageUrl('https://cdn.x/a.jpg')).toBe(true)
    expect(isImageUrl('data:image/png;base64,AAA')).toBe(true)
    expect(isImageUrl('ftp://x/a.jpg')).toBe(false)
    expect(isImageUrl('data:text/html;base64,AAA')).toBe(false)
    expect(isImageUrl('')).toBe(false)
  })
})
