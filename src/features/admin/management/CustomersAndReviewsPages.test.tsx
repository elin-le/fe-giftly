import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupMock, signInAs } from '@/api/mock/testUtils'
import { CustomersPage } from './CustomersPage'
import { ReviewsPage } from './ReviewsPage'

describe('trang quản trị Khách hàng & Đánh giá', () => {
  beforeEach(async () => {
    setupMock()
    await signInAs('admin')
  })

  it('khách hàng: tìm kiếm và khoá/mở khoá tài khoản', async () => {
    const user = userEvent.setup()
    render(<CustomersPage />)
    const table = await screen.findByRole('table', { name: 'Danh sách khách hàng' })
    expect(await within(table).findByText('user@giftly.vn')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Tìm theo/), 'khongcoai')
    expect(await screen.findByText('Chưa có dữ liệu.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText(/Tìm theo/))
    await user.click(await screen.findByRole('button', { name: /^Khoá / }))
    expect(await screen.findByText('Đã khoá tài khoản')).toBeInTheDocument()
    expect((await screen.findAllByRole('button', { name: /^Mở khoá / })).length).toBeGreaterThan(0)
  })

  it('đánh giá: xoá cần xác nhận', async () => {
    const user = userEvent.setup()
    render(<ReviewsPage />)
    const table = await screen.findByRole('table', { name: 'Danh sách đánh giá' })
    const before = (await within(table).findAllByRole('row')).length
    await user.click(within(table).getAllByRole('button', { name: /^Xoá đánh giá/ })[0]!)
    await user.click(screen.getByRole('button', { name: 'Xoá' }))
    expect(await screen.findByText('Đã xoá đánh giá')).toBeInTheDocument()
    expect(within(await screen.findByRole('table', { name: 'Danh sách đánh giá' })).queryAllByRole('row').length).toBeLessThan(before + 1)
  })
})
