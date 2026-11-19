import type MockAdapter from 'axios-mock-adapter'
import { validateImageFile } from '@/features/products/imageUpload'
import type { MockDb } from '../db'
import { fail, withAdmin } from '../http'

const toDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

/** Mock tải ảnh: thay vì Cloudinary, trả về data URL để ảnh hiển thị được ngay trong bộ nhớ. */
export function registerUploadRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onPost('/uploads').reply(
    withAdmin(db, async (_admin, config) => {
      const file = config.data instanceof FormData ? config.data.get('file') : null
      if (!(file instanceof Blob)) return fail(400, 'Thiếu tệp ảnh')
      const problem = validateImageFile(file)
      if (problem) return fail(400, problem)
      const url = await toDataUrl(file)
      return [201, { imageUrl: url, secureUrl: url, publicId: `upload/${crypto.randomUUID()}` }]
    }),
  )
}
