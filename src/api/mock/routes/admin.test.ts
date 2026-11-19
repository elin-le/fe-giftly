import { adminApi } from '@/features/admin/api/adminApi'
import { productsApi } from '@/features/products/api/productsApi'
import { CATEGORY_IDS } from '../data'
import { setupMock, signInAs } from '../testUtils'

describe('mock API · quản trị', () => {
  beforeEach(() => setupMock())

  it('khách thường không xem được Dashboard/khách hàng/đánh giá', async () => {
    await signInAs('customer')
    await expect(adminApi.dashboard()).rejects.toThrow()
    await expect(adminApi.customers()).rejects.toThrow()
    await expect(adminApi.reviews()).rejects.toThrow()
  })

  it('Dashboard và Analytics trả số liệu; khoảng thời gian lạ bị từ chối', async () => {
    await signInAs('admin')
    expect((await adminApi.dashboard()).revenueByDay).toHaveLength(30)
    expect((await adminApi.analytics(7)).revenueByDay).toHaveLength(7)
    await expect(adminApi.analytics(5)).rejects.toThrow(/7, 30 hoặc 90/)
  })

  describe('danh mục', () => {
    beforeEach(() => signInAs('admin'))

    it('thêm, sửa, xoá', async () => {
      const created = await adminApi.createCategory({ name: '  Tết  ', description: null })
      expect(created.name).toBe('Tết')
      expect((await adminApi.updateCategory(created.id, { name: 'Tết 2027', description: 'Quà Tết' })).name).toBe('Tết 2027')
      await adminApi.deleteCategory(created.id)
      expect((await productsApi.categories()).some((c) => c.id === created.id)).toBe(false)
    })

    it('từ chối tên trùng và xoá danh mục đang có sản phẩm', async () => {
      await expect(adminApi.createCategory({ name: 'sinh nhật', description: null })).rejects.toThrow(/đã tồn tại/)
      await expect(adminApi.deleteCategory(CATEGORY_IDS.birthday)).rejects.toThrow(/đang có \d+ sản phẩm/)
    })
  })

  it('khách hàng: thống kê đơn, khoá/mở tài khoản', async () => {
    await signInAs('admin')
    const customers = await adminApi.customers()
    const anh = customers.find((c) => c.email === 'user@giftly.vn')!
    expect(anh).toMatchObject({ orderCount: 3 })
    expect(anh.totalSpent).toBeGreaterThan(0)
    expect(customers.some((c) => c.email === 'admin@giftly.vn')).toBe(false)
    expect((await adminApi.setCustomerStatus(anh.id, 'SUSPENDED')).status).toBe('SUSPENDED')
    await expect(adminApi.setCustomerStatus(anh.id, 'BANNED' as never)).rejects.toThrow(/không hợp lệ/)
  })

  it('đánh giá: liệt kê kèm tên sản phẩm và xoá', async () => {
    await signInAs('admin')
    const [review] = await adminApi.reviews()
    expect(review).toMatchObject({ productName: expect.any(String) })
    await adminApi.deleteReview(review!.id)
    expect(await adminApi.reviews()).toHaveLength(0)
    await expect(adminApi.deleteReview(review!.id)).rejects.toThrow(/Không tìm thấy/)
  })
})
