import { apiClient } from '../../client'
import { ADDRESS_IDS } from '../data'
import { registerAndSignIn, setupMock, signInAs } from '../testUtils'

const input = { recipientName: 'Trần Bảo', phone: '0912345678', addressLine: '1 Hai Bà Trưng', ward: '', district: 'Quận 3', city: 'TP. HCM', isDefault: false }

describe('mock API · địa chỉ', () => {
  beforeEach(setupMock)

  it('yêu cầu đăng nhập', async () => {
    await expect(apiClient.get('/addresses')).rejects.toMatchObject({ status: 401 })
    await expect(apiClient.post('/addresses', input)).rejects.toMatchObject({ status: 401 })
  })

  it('chỉ trả địa chỉ của chính người dùng, địa chỉ mặc định đứng đầu, không lộ userId', async () => {
    await signInAs('customer')
    const { data } = await apiClient.get('/addresses')
    expect(data.map((a: { id: string }) => a.id)).toEqual([ADDRESS_IDS.home, ADDRESS_IDS.office])
    expect(data[0]).not.toHaveProperty('userId')

    await registerAndSignIn()
    expect((await apiClient.get('/addresses')).data).toEqual([])
  })

  it('địa chỉ đầu tiên tự thành mặc định; các trường trống lưu là null', async () => {
    await registerAndSignIn()
    const { data } = await apiClient.post('/addresses', input)
    expect(data).toMatchObject({ isDefault: true, ward: null, district: 'Quận 3' })
  })

  it('đặt địa chỉ mới làm mặc định thì địa chỉ cũ mất cờ mặc định (chỉ có một mặc định)', async () => {
    await signInAs('customer')
    await apiClient.post('/addresses', { ...input, isDefault: true })
    const { data } = await apiClient.get('/addresses')
    expect(data.filter((a: { isDefault: boolean }) => a.isDefault)).toHaveLength(1)
    expect(data[0]).toMatchObject({ recipientName: 'Trần Bảo', isDefault: true })
  })

  it.each([
    ['thiếu tên người nhận', { recipientName: ' ' }],
    ['thiếu số điện thoại', { phone: '' }],
    ['thiếu địa chỉ', { addressLine: '' }],
  ])('từ chối khi %s (400)', async (_label, override) => {
    await signInAs('customer')
    await expect(apiClient.post('/addresses', { ...input, ...override })).rejects.toMatchObject({ status: 400 })
  })
})
