import { apiClient } from '@/api/client'
import { ensureObject } from '@/api/ensureObject'

export interface UploadedImage {
  imageUrl: string
  secureUrl: string
  publicId: string
}

export const uploadsApi = {
  /** Tải ảnh từ thiết bị (multipart); backend thật đẩy lên Cloudinary và trả về đường dẫn. */
  image: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<unknown>('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => ensureObject<UploadedImage>(res.data, ['imageUrl', 'secureUrl', 'publicId']))
  },
}
