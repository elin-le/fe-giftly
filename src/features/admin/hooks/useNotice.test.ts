import { act, renderHook } from '@testing-library/react'
import { useNotice } from './useNotice'

describe('useNotice', () => {
  it('bắt đầu không có thông báo', () => {
    const { result } = renderHook(() => useNotice())
    expect(result.current.notice).toBeNull()
  })

  it('success và error đặt đúng mức độ', () => {
    const { result } = renderHook(() => useNotice())
    act(() => result.current.success('Xong'))
    expect(result.current.notice).toEqual({ message: 'Xong', severity: 'success' })
    act(() => result.current.error('Lỗi'))
    expect(result.current.notice).toEqual({ message: 'Lỗi', severity: 'error' })
  })

  it('dismiss xoá thông báo', () => {
    const { result } = renderHook(() => useNotice())
    act(() => result.current.success('Xong'))
    act(() => result.current.dismiss())
    expect(result.current.notice).toBeNull()
  })
})
