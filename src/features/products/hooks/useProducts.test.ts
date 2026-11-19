import { renderHook, waitFor } from '@testing-library/react'
import { productsApi } from '../api/productsApi'
import { useCategories, useProducts } from './useProducts'

vi.mock('../api/productsApi', () => ({
  productsApi: { list: vi.fn(), categories: vi.fn() },
}))

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('tải danh sách theo bộ lọc', async () => {
    vi.mocked(productsApi.list).mockResolvedValue([])
    const { result } = renderHook(() => useProducts({ search: 'nến', categoryId: 'birthday' }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(productsApi.list).toHaveBeenCalledWith({ search: 'nến', categoryId: 'birthday' })
  })

  it('tải lại khi bộ lọc thay đổi', async () => {
    vi.mocked(productsApi.list).mockResolvedValue([])
    const { rerender } = renderHook(({ search }) => useProducts({ search }), { initialProps: { search: 'a' } })
    await waitFor(() => expect(productsApi.list).toHaveBeenCalledTimes(1))
    rerender({ search: 'ab' })
    await waitFor(() => expect(productsApi.list).toHaveBeenCalledTimes(2))
  })

  it('trả về lỗi khi API thất bại', async () => {
    vi.mocked(productsApi.list).mockRejectedValue(new Error('Mất kết nối'))
    const { result } = renderHook(() => useProducts({}))
    await waitFor(() => expect(result.current.error).toBe('Mất kết nối'))
  })

  it('useCategories tải danh mục một lần', async () => {
    vi.mocked(productsApi.categories).mockResolvedValue([{ id: 'a', name: 'A', description: null }])
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'a', name: 'A', description: null }]))
  })
})
