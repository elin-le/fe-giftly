import { TOAST_DURATION_MS, useToastStore } from './toastStore'

const state = () => useToastStore.getState()

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })
  afterEach(() => vi.useRealTimers())

  it('thêm thông báo với tông mặc định là info', () => {
    state().show('Xin chào')
    expect(state().toasts).toMatchObject([{ message: 'Xin chào', tone: 'info' }])
  })

  it('tự biến mất sau thời gian quy định', () => {
    state().show('Đã thêm', 'success')
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1)
    expect(state().toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(state().toasts).toHaveLength(0)
  })

  it('chỉ giữ tối đa 3 thông báo mới nhất', () => {
    ;['a', 'b', 'c', 'd'].forEach((message) => state().show(message))
    expect(state().toasts.map((toast) => toast.message)).toEqual(['b', 'c', 'd'])
  })

  it('đóng thủ công đúng thông báo và không lỗi khi đóng lại', () => {
    state().show('a')
    state().show('b')
    const [first] = state().toasts
    state().dismiss(first!.id)
    expect(state().toasts.map((toast) => toast.message)).toEqual(['b'])
    expect(() => state().dismiss(first!.id)).not.toThrow()
  })
})
