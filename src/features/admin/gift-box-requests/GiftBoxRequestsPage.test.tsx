import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VARIANT_IDS as V } from '@/api/mock/data'
import { setupMock, signInAs } from '@/api/mock/testUtils'
import { giftBoxApi } from '@/features/gift-builder/api/giftBoxApi'
import { GiftBoxRequestsPage } from './GiftBoxRequestsPage'

const slightlyOver = {
  boxVariantId: V.boxS,
  items: [{ productVariantId: V.cookies, quantity: 1 }, { productVariantId: V.notebookBrown, quantity: 1 }, { productVariantId: V.candle100, quantity: 1 }],
}

describe('GiftBoxRequestsPage', () => {
  beforeEach(async () => {
    setupMock()
    await signInAs('customer')
    await giftBoxApi.create(slightlyOver)
    await signInAs('admin')
  })

  it('hiện yêu cầu chờ duyệt kèm mức vượt, mở chi tiết thấy cách liên hệ khách', async () => {
    const user = userEvent.setup()
    render(<GiftBoxRequestsPage />)
    expect(await screen.findByText('Chờ duyệt')).toBeInTheDocument()
    expect(screen.getByText(/1 yêu cầu đang chờ/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xem chi tiết' }))
    expect(await screen.findByText(/user@giftly.vn/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeInTheDocument()
  })

  it('duyệt xong thì đổi trạng thái và hết cần xem xét', async () => {
    const user = userEvent.setup()
    render(<GiftBoxRequestsPage />)
    await user.click(await screen.findByRole('button', { name: 'Xem chi tiết' }))
    await user.click(await screen.findByRole('button', { name: 'Duyệt' }))
    expect(await screen.findByText('Đã duyệt')).toBeInTheDocument()
    expect(screen.getByText(/Không có yêu cầu nào đang chờ/)).toBeInTheDocument()
  })

  it('từ chối bắt buộc có lý do', async () => {
    const user = userEvent.setup()
    render(<GiftBoxRequestsPage />)
    await user.click(await screen.findByRole('button', { name: 'Xem chi tiết' }))
    await user.click(await screen.findByRole('button', { name: 'Từ chối…' }))
    const submit = screen.getByRole('button', { name: 'Từ chối' })
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/Lý do/), 'Hộp hơi chật, bạn đổi sang hộp M nhé')
    await user.click(submit)
    expect(await screen.findByText('Đã từ chối')).toBeInTheDocument()
  })
})
