import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { makeProduct } from '@/features/products/testUtils'
import { productsApi } from '@/features/products/api/productsApi'
import { HomePage } from './HomePage'

vi.mock('@/features/products/api/productsApi', () => ({
  productsApi: { featured: vi.fn(), categories: vi.fn() },
}))

describe('HomePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hiện danh mục và sản phẩm hot ngay trên trang chủ', async () => {
    vi.mocked(productsApi.categories).mockResolvedValue([{ id: 'c1', name: 'Sinh nhật', description: null }])
    vi.mocked(productsApi.featured).mockResolvedValue([makeProduct({ name: 'Nến thơm Hoa Nhài' })])
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(await screen.findByRole('link', { name: /Sinh nhật/ })).toHaveAttribute('href', '/products?categoryId=c1')
    expect(await screen.findByText('Nến thơm Hoa Nhài')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Zalo 0839003848/ })).toBeInTheDocument()
  })

  it('báo lỗi khi không tải được sản phẩm hot', async () => {
    vi.mocked(productsApi.categories).mockResolvedValue([])
    vi.mocked(productsApi.featured).mockRejectedValue(new Error('x'))
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
