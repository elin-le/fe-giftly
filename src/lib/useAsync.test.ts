import { act, renderHook, waitFor } from '@testing-library/react'
import { useAsync } from './useAsync'

describe('useAsync', () => {
  it('trả về dữ liệu sau khi tải xong', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42), []))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(42)
    expect(result.current.error).toBeNull()
  })

  it('trả về thông báo lỗi khi promise bị reject', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('boom')), []))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('boom')
    expect(result.current.data).toBeUndefined()
  })

  it('chỉ nhận kết quả của lần gọi mới nhất', async () => {
    let resolveSlow: (value: string) => void = () => {}
    const slow = new Promise<string>((resolve) => (resolveSlow = resolve))
    const { result, rerender } = renderHook(
      ({ key }) => useAsync(() => (key === 'a' ? slow : Promise.resolve('b')), [key]),
      { initialProps: { key: 'a' } },
    )
    rerender({ key: 'b' })
    await waitFor(() => expect(result.current.data).toBe('b'))
    await act(async () => resolveSlow('a'))
    expect(result.current.data).toBe('b')
  })

  it('reload gọi lại fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue('x')
    const { result } = renderHook(() => useAsync(fetcher, []))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.reload())
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })
})
